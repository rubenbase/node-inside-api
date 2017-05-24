var mongoose = require('mongoose');

var Product = mongoose.model('Product', {
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  type: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  plan: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  price: {
    type: Number,
    default: null
  },
  completedAt: {
    type: Number,
    default: null
  },
});

module.exports = {Product};
