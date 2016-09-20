'use strict';

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const config = require('./config');

// initialise SMS verification app
const app = express();

// manage HTTP sessions
app.use(session({
    secret: config.secret,
    resave: true,
    saveUninitialized: true
}));

// parse form-encoded HTTP bodies
app.use(bodyParser.urlencoded({
    extended: true
}));

// log HTTP errors
logger('combined', {
  skip: (req, res) => { return res.statusCode < 400 }
});

// used for flash messages
app.use(flash());

// connect to MongoDB
mongoose.connect(config.mongoUrl);

// set up routes
require('./routes')(app);

// set view engine as pug (formally jade)
app.set('view engine', 'pug');

// serve static assets
app.use(express.static(__dirname + '/public'));

// launch app to listen on designated port
app.listen(config.port, () => {
    console.log('Server listening on port ' + config.port);
});