const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    unique: true,
  },
  price: {
    type: Number,
    require: true,
  },
  amount: {
    type: Number,
    require: true,
  },
  path: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model('Product', schema);
