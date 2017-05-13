var mongoose = require('mongoose');

var sales = mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    product: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    offer: {
        type: String,
        required: true
    },
    userId: {
        type: Boolean,
        default: true
    },
    client: {
        nombre: String,
        apellidos: String,
        address: String,
        phone: Number
    },
    image: {
        type: Object
    }
});

module.exports = mongoose.model('sales', sale);