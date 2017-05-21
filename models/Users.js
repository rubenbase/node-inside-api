const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); 
const _ = require('lodash'); 

var UserSchema = mongoose.Schema({
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
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required:true
        }
    }],
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

UserSchema.methods.toJSON = function (){
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
}

UserSchema.methods.generateAuthToken = function (){
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(),access}, 'abc123').toString();

  user.tokens.push({access, token});

  user.save().then(() => {
      return token;
  });
};

module.exports = mongoose.model('users', UserSchema);
