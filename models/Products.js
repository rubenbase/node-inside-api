var mongoose = require('mongoose');

var products = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    prize: {
        type: Number,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    description: {
        type: String,
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