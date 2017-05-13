const express = require('express');
const hbs = require('hbs');
const fs = require('fs');

var app = express();

hbs.registerPartials(__dirname + '/views/partials')
app.set('view engine', 'hbs');

app.use((req, res, next) => {
    let now = new Date().toString();
    let log = `${now}: ${req.method} ${req.url} ${req.hostname} ${req.ip}`;

    fs.appendFile('server.log', log + '/n');
    next();
});

app.use((req, res, next) => {
    res.render('maintenance.hbs');
});

app.use('/public',express.static(__dirname + '/public'));

hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
});

/******* URLS *********/

//Home
app.get('/', (req, res) => {
    res.render('home.hbs', {
        pageTitle : 'Home'
    });
});

//Login
app.get('/login', (req, res) => {
    res.render('login.hbs', {
        pageTitle : 'Login'
    });
});

//404
app.get('/404', (req, res) => {
    res.send({
       errorMessage : 'Unable to handle request' 
    });
});

app.listen(3000, () => {
    console.log('Server is up on port 3000');
}); 