const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Sale} = require('./../models/sale');
const {User} = require('./../models/user');
const {sales, populateSales, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateSales);

describe('POST /sales', () => {
  it('should create a new sale', (done) => {
    var text = 'Test sale text';

    request(app)
      .post('/sales')
      .set('x-auth', users[0].tokens[0].token)
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Sale.find({text}).then((sales) => {
          expect(sales.length).toBe(1);
          expect(sales[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create sale with invalid body data', (done) => {
    request(app)
      .post('/sales')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Sale.find().then((sales) => {
          expect(sales.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /sales', () => {
  it('should get all sales', (done) => {
    request(app)
      .get('/sales')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.sales.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /sales/:id', () => {
  it('should return sale doc', (done) => {
    request(app)
      .get(`/sales/${sales[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.sale.text).toBe(sales[0].text);
      })
      .end(done);
  });

  it('should not return sale doc created by other user', (done) => {
    request(app)
      .get(`/sales/${sales[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if sale not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/sales/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/sales/123abc')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /sales/:id', () => {
  it('should remove a sale', (done) => {
    var hexId = sales[1]._id.toHexString();

    request(app)
      .delete(`/sales/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.sale._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Sales.findById(hexId).then((sale) => {
          expect(sale).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should remove a sale', (done) => {
    var hexId = sales[0]._id.toHexString();

    request(app)
      .delete(`/sales/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Sale.findById(hexId).then((sale) => {
          expect(sale).toExist();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if sale not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .delete(`/sales/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete('/sales/123abc')
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /sales/:id', () => {
  it('should update the sale', (done) => {
    var hexId = sales[0]._id.toHexString();
    var text = 'This should be the new text';

    request(app)
      .patch(`/sales/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.sale.text).toBe(text);
        expect(res.body.sale.completed).toBe(true);
        expect(res.body.sale.completedAt).toBeA('number');
      })
      .end(done);
  });

  it('should not update the sale created by other user', (done) => {
    var hexId = sales[0]._id.toHexString();
    var text = 'This should be the new text';

    request(app)
      .patch(`/sales/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(404)
      .end(done);
  });

  it('should clear completedAt when sale is not completed', (done) => {
    var hexId = sales[1]._id.toHexString();
    var text = 'This should be the new text!!';

    request(app)
      .patch(`/sales/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        completed: false,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.sale.text).toBe(text);
        expect(res.body.sale.completed).toBe(false);
        expect(res.body.sale.completedAt).toNotExist();
      })
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'example@example.com';
    var password = '123mnb!';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return validation errors if request invalid', (done) => {
    request(app)
      .post('/users')
      .send({
        email: 'and',
        password: '123'
      })
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', (done) => {
    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: 'Password123!'
      })
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + '1'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});
