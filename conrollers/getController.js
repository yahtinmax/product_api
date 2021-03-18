const models = require('../models');

module.exports = {
  getAllProducts: (req, res) => {
    const perPage = req.query.perPage || process.env.PER_PAGE;
    const page = req.query.page || 1;

    if (isNaN(perPage) || isNaN(page)) {
      res.status(400).json({
        error: 'Incorrect type of input data',
      });
    } else {
      models.Product.find({})
        .skip(+perPage * +page - +perPage)
        .limit(+perPage)
        .then((products) => res.status(200).json(products))
        .catch((err) => {
          res.status(500).json({
            error: 'Internal server error',
          });
        });
    }
  },

  getOneProduct: (req, res) => {
    const id = req.params.id;

    models.Product.findById(id)
      .then((product) => {
        !product
          ? res.status(404).json({
              error: 'Product with this ObjectId is not found',
            })
          : res.status(200).json({
              product,
            });
      })
      .catch((err) => {
        res.status(400).json({
          error: 'Not valid ObjectId',
        });
      });
  },

  //Если Имя не передается, ищем возвращаем результат по любому наименованию
  searchProducts: (req, res) => {
    const name = req.query.name || '';
    const price = req.query.price || 1000000000000;

    models.Product.find({
      name: { $regex: `${name}` },
      price: { $lte: +price },
      amount: { $gt: 0 },
    })
      .then((products) => {
        res.status(200).json({
          products,
        });
      })
      .catch((err) => {
        res.status(400).json({
          error: 'Incorrect type of input data',
        });
      });
  },
};
