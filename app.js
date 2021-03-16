require('dotenv').config();

const express = require('express'),
  bodyParser = require('body-parser'),
  multer = require('multer'),
  path = require('path'),
  fs = require('fs'),
  mongoose = require('mongoose'),
  Product = require('./models/product.js');

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

const storage = multer.diskStorage({
  destination: 'public/images',
  filename: function (req, file, callback) {
    callback(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      const err = new Error('Extention');
      err.code = 'EXTENTION';
      return cb(err);
    }
    cb(null, true);
  },
}).single('filedata');

mongoose.connection
  .on('error', (error) => console.log(error))
  .on('close', () => console.log('Database connection closing...'))
  .once('open', () => {
    const info = mongoose.connections[0];
    console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
  });

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const app = express();

//middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

//routes
//Get all products with paggination(params get from req.body)
app.get('/products', (req, res) => {
  const perPage = req.query.perPage || process.env.PER_PAGE;
  const page = req.query.page || 1;

  if (isNaN(perPage) || isNaN(page)) {
    res.status(400).json({
      error: 'Incorrect types of input data',
    });
  } else {
    Product.find({})
      .skip(+perPage * +page - +perPage)
      .limit(+perPage)
      .then((products) => res.status(200).json(products));
  }
});

//Get products by filtering criterion
app.get('/products/search', (req, res) => {
  const name = req.query.name;
  const price = req.query.price || 1000000000000;

  if (!name) {
    if (isNaN(price)) {
      res.status(400).json({
        error: 'Incorrect types of input data',
      });
    } else {
      Product.find({
        price: { $lte: +price },
        amount: { $gt: 0 },
      }).then((products) => {
        res.status(200).json({
          products,
        });
      });
    }
  } else {
    Product.find({
      name: { $regex: `${name}` },
      price: { $lte: +price },
      amount: { $gt: 0 },
    }).then((products) =>
      res.json({
        products,
      })
    );
  }
});

//Get one product
app.get('/products/:id', (req, res) => {
  const id = req.params.id;

  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    Product.findById(id).then((product) => {
      if (!product) {
        res.status(404).json({
          error: 'Product with this ObjectId is not found',
        });
      } else {
        res.status(200).json({
          product,
        });
      }
    });
  } else {
    res.status(400).json({
      error: 'Not valid ObjectId',
    });
  }
});

//Add new product
app.post('/products/add', (req, res) => {
  const { name, price, amount } = req.body;
  if (!name || !price || !amount) {
    res.status(400).json({
      error: 'Not all fields are filled',
    });
  } else if (isNaN(price) || isNaN(amount)) {
    res.status(400).json({
      error: 'Some fields type isNaN',
    });
  } else if (name.length < 2) {
    res.status(400).json({
      error: 'Product name is too short',
    });
  } else {
    Product.create({
      name,
      price,
      amount,
    })
      .then((product) => {
        res.status(200).json({ message: `Product ${product.name} added` });
      })
      .catch((err) => {
        res.status(400).json({
          error: 'Product with this name is already exist. Try again',
        });
      });
  }
});

//upload product image. Work with jpeg and png, delete previous image
app.post('/products/upload/:id', (req, res) => {
  const id = req.params.id || '1';

  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    Product.findById(id).then((item) => {
      if (item) {
        upload(req, res, (err) => {
          let error = '';
          if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              error = 'Image size lte 2mb';
            }
            if (err.code === 'EXTENTION') {
              error = 'Correct extension is jpeg and png';
            }
            res.status(400).json({
              error: error,
            });
          } else {
            if (item.path !== null) {
              const filePath = path.join(__dirname, item.path);
              fs.unlinkSync(filePath);
            } else {
              Product.findByIdAndUpdate(id, { path: `${req.file.path}` }).then(
                () => {
                  res.status(200).json({
                    message: `Product ${id} succesfully update with image ${req.file.originalname}`,
                  });
                }
              );
            }
          }
        });
      } else {
        res.status(404).json({
          error: 'Product with this ObjectId is not found',
        });
      }
    });
  } else {
    res.status(400).json({
      error: 'Not valid ObjectId',
    });
  }
});

//update all products by filter criterion and delete product image from fs
app.put('/products/update', (req, res) => {
  const { id, name, price, amount } = req.body;
  console.log(id, name, price, amount);

  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    Product.findById(id).then((product) => {
      if (!product) {
        res.status(404).json({
          error: 'Product with this ObjectId is not found',
        });
      } else {
        Product.findByIdAndUpdate(id, {
          name: name || product.name,
          price: (isNaN(price) ? null : price) || product.price,
          amount: (isNaN(amount) ? null : amount) || product.amount,
        }).then(() => {
          res.status(200).json({
            message: 'Update complete',
          });
        });
      }
    });
  } else {
    res.status(400).json({
      error: 'Not valid ObjectId',
    });
  }
});

//delete product by ObjectId
app.delete('/products/delete/:id', (req, res) => {
  const id = req.params.id || '1';

  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    Product.findById(id).then((product) => {
      if (!product) {
        res.status(404).json({
          error: 'Product with this ObjectId is not found',
        });
      } else {
        Product.findByIdAndDelete(id).then(() => {
          if (product.path !== null) {
            const filePath = path.join(__dirname, product.path);
            fs.unlinkSync(filePath);
          } else {
            res.status(200).json({
              message: `Product ${product.name} has been deleted with image ${product.path}`,
            });
          }
        });
      }
    });
  } else {
    res.status(400).json({
      error: 'Not valid ObjectId',
    });
  }
});

//404 catch
app.use((req, res) => {
  res
    .status(404)
    .json({ error: '404. Sorry we can find this route. Try again' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
