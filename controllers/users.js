'use strict';

const User = require('../models/User');

// authenticate a user
exports.authenticate = (req, res) => {
    let userId = req.body.userId;
    let pwd = req.body.password;
    
    // find a user in the database whose username or email matches the login ID
    User.findOne({$or: [{username: userId}, {email: userId}]}, (err, user) => {
        if (err) {
            errorHandler(req, res, 'authForm', '', 'default');
        }
        // if the user does not exist, render login page with error message
        if (!user) {
            errorHandler(req, res, 'authForm', '', 'User does not exist. Please check your credentials.');
        } else {
            user.comparePassword(pwd, (err, isMatch) => {
                if (err) {
                    errorHandler(req, res, 'authForm', '', 'default');
                }
                // if passwords do not match, render login page with error message
                if (!isMatch) {
                    errorHandler(req, res, 'authForm', '', 'Login failed. Please check your credentials.');
                } else if (!user.verified) { // if the user isn't verified, direct the user to verification
                    sendVerificationCode(user._id, req, res, false);
                } else { // otherwise, redirect to user home page
                    res.redirect(301, '/users/' + user._id);
                }
            });
        }
    });
};

// create and save a new user
exports.create = (req, res) => {
    let info = req.body;
    
    // check if the user already exists
    User.findOne({$or: [{username: info.username}, {email: info.email}, {phone: info.phone}]}, (err, user) => {
        if (err) {
            errorHandler(req, res, 'createForm', '', 'default');
        }
        if (user) {
            errorHandler(req, res, 'createForm', '', 'Username, email or phone number matches an existing user. Please log in.');
        } else {
            // generate verification code
            let code = generateCode();
            // initialise a new user
            let newUser = new User({
                username: info.username,
                email: info.email,
                password: info.password,
                phone: info.phone,
                verificationCode: code
            });

            // save the new user to the database
            newUser.save((err, user) => {
                if (err) {
                    errorHandler(req, res, 'createForm', '', 'default');
                }
                // direct the user to verification
                sendVerificationCode(user._id, req, res, false);
            });  
        }
    });
};

// verify the user using SMS verification code
exports.verify = (req, res) => {
    let id = req.params.id;
    let code = req.body.code;
    
    // find the corresponding user
    User.findById(id, (err, user) => {
        if (err || !user) {
            errorHandler(req, res, 'verification', id, 'default');
        }
        // compare the verification code with the one in the database
        if (code !== user.verificationCode) {
            errorHandler(req, res, 'verification', id, 'Incorrect verification code. Please check and try again.');
        } else {
            user.verified = true;
            user.save((err, usr) => {
                if (err) {
                    errorHandler(req, res, 'verification', id, 'default');
                }
                // redirect to the user home page with success message
                res.render('user', {msg: 'You have successfully verified your account!'});
            });
        }
    });
};

exports.resend = (req, res) => {
    let id = req.params.id;
    User.findById(id, (err, user) => {
        if (err || !user) {
            errorHandler(req, res, 'verification', id, 'default');
        }
        user.verificationCode = generateCode();
        user.save((err, user) => {
            if (err) {
                errorHandler(req, res, 'verification', id, 'default');
            }
            // send the new verification code
            sendVerificationCode(user._id, req, res, true);
        });
    });
};

// helper function to generate verification code
function generateCode() {
    let code = '';
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 6; i > 0; i -= 1) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// helper function to send SMS verification code
function sendVerificationCode(userId, req, res, resend) { 
    User.findById(userId, (err, user) => {
        if (err || !user) {
            errorHandler(req, res, 'authForm', '', 'default');
        }
        if (user.codeSentCount > 5) { // limit the number of verification attempts to prevent spamming
            res.render('createForm', {msg: 'Account disabled due to too many failed verification attempts. Please register for a new account.'});
        } else { 
            let msg = 'Your account verification code is: ' + user.verificationCode;
            user.sendMessage(msg); // send SMS verification code to user's phone
            user.codeSentCount += 1;
            user.save((err, user) => {
                if (err) {
                    errorHandler(req, res, 'authForm', '', 'default');
                } else {
                    // redirect the user to verification page
                    if (resend) {
                        res.render('verification', {msg: 'Code resent! Please check your phone.', id: user._id});
                    } else {
                        res.render('verification', {id: user._id});
                    }
                }
            });
        }
    });
}

// helper function for error handling
function errorHandler(req, res, redirectUrl, userId, msg) {
    if (msg === 'default') {
        msg = 'Sorry, an error occured. Please try again.';
    }
    req.flash('msg', msg);
    res.render(redirectUrl, {msg: req.flash('msg'), id: userId});
}