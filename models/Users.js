var mongoose = require('mongoose');

var user = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true
    },
    firstTime: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        required: true
    },
    regTime: {
        type: Date,
        default: Date.now
    },
    address: {
        type: String
    },
    name: {
        type: String
    },
    lastName: {
        type: String
    },
    admin: {
        type: boolean
    }
});

module.exports = mongoose.model('users', user);
