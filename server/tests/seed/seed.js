const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Sale} = require('./../../models/sale');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
  _id: userOneId,
  email: 'ruben@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'},"poijasdf98435jpgfdpoij3").toString()
  }]
}, {
  _id: userTwoId,
  email: 'nerea@example.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, "poijasdf98435jpgfdpoij3").toString()
  }]
}];

const sales = [{
  _id: new ObjectID(),
  text: 'First test sale',
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'Second test sale',
  completed: true,
  completedAt: 333,
  _creator: userTwoId
}];

const populateSales = (done) => {
  Sale.remove({}).then(() => {
    return Sale.insertMany(sales);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo])
  }).then(() => done());
};

module.exports = {sales, populateSales, users, populateUsers};
