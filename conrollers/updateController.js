const models = require('../models'),
  upload = require('../multerConfig'),
  path = require('path'),
  fs = require('fs');

module.exports = {
  uploadImage: (req, res) => {
    const id = req.params.id;

    models.Product.findById(id)
      .then((item) => {
        !item
          ? res.status(404).json({
              error: 'Product with this ObjectId is not found',
            })
          : upload(req, res, (err) => {
              checkErrorCode(req, res, err);
              if (!item.path) {
                models.Product.findByIdAndUpdate(id, {
                  path: `${req.file.path}`,
                })
                  .then(() => {
                    res.status(200).json({
                      message: `Product ${id} succesfully update with image ${req.file.originalname}`,
                    });
                  })
                  .catch((err) => {
                    res.status(500).json({
                      error: 'Internal server error',
                    });
                  });
              } else {
                const filePath = path.join(
                  path.dirname(require.main.filename),
                  item.path
                );
                fs.unlinkSync(filePath);
                res.status(200).json({
                  message: `Product ${id} succesfully update with image ${req.file.originalname}`,
                });
              }
            });
      })
      .catch((err) => {
        res.status(400).json({
          error: 'Not valid ObjectId',
        });
      });
  },

  addNewProduct: (req, res) => {
    const error = newProductCheckValid(req);
    !error
      ? models.Product.create({
          name: req.body.name,
          price: req.body.price,
          amount: req.body.amount,
        })
          .then((product) => {
            res.status(200).json({ message: `Product ${product.name} added` });
          })
          .catch((err) => {
            res.status(400).json({
              error: 'Product with this name is already exist. Try again',
            });
          })
      : res.status(400).json({
          error,
        });
  },

  updateProduct: (req, res) => {
    const { id, name, price, amount } = req.body;

    models.Product.findById(id)
      .then((product) => {
        if (!product) {
          res.status(404).json({
            error: 'Product with this ObjectId is not found',
          });
        } else {
          models.Product.findByIdAndUpdate(id, {
            name: name || product.name,
            price: (isNaN(price) ? null : price) || product.price,
            amount: (isNaN(amount) ? null : amount) || product.amount,
          })
            .then(() => {
              res.status(200).json({
                message: 'Update complete',
              });
            })
            .catch((err) => {
              res.status(500).json({
                error: 'Internal server error',
              });
            });
        }
      })
      .catch((err) => {
        res.status(400).json({
          error: 'Not valid ObjectId',
        });
      });
  },

  deleteProduct: (req, res) => {
    const id = req.params.id || '1';

    models.Product.findById(id)
      .then((product) => {
        if (!product) {
          res.status(404).json({
            error: 'Product with this ObjectId is not found',
          });
        } else {
          models.Product.findByIdAndDelete(id)
            .then(() => {
              if (!product.path) {
                res.status(200).json({
                  message: `Product ${product.name} has been deleted`,
                });
              } else {
                const filePath = path.join(
                  path.dirname(require.main.filename),
                  product.path
                );
                fs.unlinkSync(filePath);
                res.status(200).json({
                  message: `Product ${product.name} has been deleted  with image ${product.path}`,
                });
              }
            })
            .catch((err) => {
              res.status(500).json({
                error: 'Internal server error',
              });
            });
        }
      })
      .catch((err) => {
        res.status(400).json({
          error: 'Not valid ObjectId',
        });
      });
  },
};

function checkErrorCode(req, res, err) {
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
  } else return;
}

function newProductCheckValid(req, res) {
  const { name, price, amount } = req.body;
  let error = '';
  if (!name || !price || !amount) {
    error = 'Not all fields are filled';
  } else if (isNaN(price) || isNaN(amount)) {
    error = 'Some fields type isNaN';
  } else if (name.length < 2) {
    error = 'Product name is too short';
  }
  return error;
}
