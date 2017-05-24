var mongoose = require('mongoose');

var Sale = mongoose.model('Sale', {
  products: [{
    productId: {
      type: String,
      required: true,
      minlength: 1,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      default: null
    },
    description: {
      type: String,
      required: true
    },
  }],
  totalPrice: {
    type: Number,
      required: true,
      default: null
  },
  description: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  location: {
    metadata: {
      country: String,
      locality: String,
      address: String,
      postalCode: Number,
    },
    coords: {
      lat:Number, 
      lng:Number
    }
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

module.exports = {Sale};
