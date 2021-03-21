const boom = require('boom'),
  models = require('../models'),
  path = require('path'),
  fs = require('fs');

module.exports = {
  addNewProduct: async (product) => {
    const error = newProductCheckValid(product);
    if (!error) {
      await models.Product.create({
        name: product.name,
        price: product.price,
        amount: product.amount,
      }).catch((err) => {
        throw boom.badRequest(
          'Product with this name is already exist. Try again'
        );
      });
      return { message: `Product ${product.name} added` };
    } else {
      throw boom.badRequest(error);
    }
  },

  updateProduct: async (product) => {
    const { id, name, price, amount } = product;

    const item = await models.Product.findById(id).catch((err) => {
      throw boom.badRequest('Not valid ObjectId');
    });
    if (!item) {
      throw boom.notFound('Product with this ObjectId is not found');
    } else {
      await models.Product.findByIdAndUpdate(id, {
        name: name || item.name,
        price: (isNaN(price) ? null : price) || item.price,
        amount: (isNaN(amount) ? null : amount) || item.amount,
      }).catch((err) => {
        throw boom.badRequest('Not valid ObjectId');
      });
      return {
        message: 'Update complete',
      };
    }
  },

  deleteProduct: async (id) => {
    const product = await models.Product.findById(id).catch((err) => {
      throw boom.badRequest('Not valid ObjectId');
    });
    if (!product) {
      throw boom.notFound('Product with this ObjectId is not found');
    } else {
      await models.Product.findByIdAndDelete(id);
      if (!product.path) {
        return {
          message: `Product ${product.name} has been deleted`,
        };
      } else {
        const filePath = path.join(
          path.dirname(require.main.filename),
          product.path
        );
        fs.unlinkSync(filePath);
        return {
          message: `Product ${product.name} has been deleted  with image ${product.path}`,
        };
      }
    }
  },
};

function newProductCheckValid(product) {
  const { name, price, amount } = product;
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
