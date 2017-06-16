// require('./config/config');
var stripe = require('stripe')('sk_test_ixjvfb4PeeIyNJgqkKymNwuw');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Product} = require('./models/product');
var {Sale} = require('./models/sale');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/processPay', authenticate, (req, res) => {
  var stripeToken = req.body.stripeToken;
  var amountPayable = req.body.amountPayable;
  var charge = stripe.charge.create({
    amount: amountPayable,
    currency: 'eur',
    description: 'Product payment',
    source: stripeToken
  }, function(err, charge){
    if (err){
      console.log(err);
    }else{
      res.send({success: true});
    }
  });
});

app.post('/sales', authenticate, (req, res) => {
  var sale = new Sale({
    completed: req.body.completed,
    totalPrice: req.body.totalPrice,
    description: req.body.description,
    completedAt: req.body.completedAt,
    startedAt: req.body.startedAt,
    products: req.body.products,
    location: req.body.location,
    _creator: req.user._id
  });

  sale.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    console.log(req);
    console.log(res);
    res.status(400).send(e);
  });
});

app.get('/sales', authenticate, (req, res) => {
  Sale.find({
    _creator: req.user._id
  }).then((sales) => {
    res.send({sales});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/sales/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Sale.findOne({
    _id: id,
    _creator: req.user._id
  }).then((sale) => {
    if (!sale) {
      return res.status(404).send();
    }

    res.send({sale});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/sales/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Sale.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((sale) => {
    if (!sale) {
      return res.status(404).send();
    }

    res.send({sale});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.put('/sales/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['description', 'totalPrice', 'completed', 
  'completedAt', 'startedAt', 'products', 'location']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Sale.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((sale) => {
    if (!sale) {
      return res.status(404).send();
    }

    res.send({sale});
  }).catch((e) => {
    res.status(400).send();
  })
});

// POST /users
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);
console.log(req.body);
  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      user.token = token;
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};
