'use strict';

module.exports = {
    // render login form
    renderAuthForm: (req, res) => {
        res.render('authForm');
    },
    // render signup form
    renderCreateForm: (req, res) => {
        res.render('createForm');
    },
    // render verification page
    renderVerification: (req, res) => {
        res.render('verification');
    },
    // render user home page
    renderUser: (req, res) => {
        res.render('user');
    }
};