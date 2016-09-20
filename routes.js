'use strict';

const index = require('./controllers/index');
const users = require('./controllers/users');

module.exports = function (app) {
    // routes for GET requests
    app.get('/', index.renderAuthForm);
    app.get('/users/new', index.renderCreateForm);
    app.get('/users/:id/verify', index.renderVerification);
    app.get('/users/:id', index.renderUser);
    
    // routes for POST requests
    app.post('/users', users.authenticate);
    app.post('/users/new', users.create);
    app.post('/users/:id/verify', users.verify);
    app.post('/users/:id/resend', users.resend);
};