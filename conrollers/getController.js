const models = require('../models');
const boom = require('boom');

module.exports = {
  getAllProducts: async (page, perPage) => {
    if (isNaN(perPage) || isNaN(page)) {
      throw boom.badRequest('Incorrect type of input data');
    } else {
      const result = await models.Product.find({})
        .skip(+perPage * +page - +perPage)
        .limit(+perPage)
        .catch((err) => {
          throw boom.badImplementation(err);
        });
      return result;
    }
  },

  getOneProduct: async (id) => {
    const result = await models.Product.findById(id).catch((err) => {
      throw boom.badRequest('Not valid ObjectId');
    });
    if (!result)
      throw boom.badRequest('Product with this ObjectId is not found');
    else return result;
  },

  //Если Имя не передается, ищем возвращаем результат по любому наименованию
  searchProducts: async (name, price) => {
    const result = await models.Product.find({
      name: { $regex: `${name}` },
      price: { $lte: +price },
      amount: { $gt: 0 },
    }).catch((err) => {
      throw boom.badRequest('Incorrect type of input data');
    });
    return result;
  },
};
