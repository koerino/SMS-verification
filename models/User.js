'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config');
const client = require('twilio')(config.accountSid, config.authToken);

// used for password hashing
const SALT_WORK_FACTOR = 10;

// schema that represents a user
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String
    },
    codeSentCount: {
        type: Number,
        default: 0
    }
});

// hash the user's password before saving
UserSchema.pre('save', function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (err) {
            return next(err);
        }

        bcrypt.hash(this.password, salt, (err, hash) => {
            if (err) {
                return next(err);
            }

            this.password = hash;
            next();
        });
    });
});

// compare passwords
UserSchema.methods.comparePassword = function (password, cb) {
    bcrypt.compare(password, this.password, (err, isMatch) => {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

// send SMS message to the user
UserSchema.methods.sendMessage = function (message) {
    client.messages.create({
        to: '+1' + this.phone,
        from: config.twilioNumber,
        body: message
    }, (err, message) => {
        if (err) {
            console.log(err);
        }
    });
};

module.exports = mongoose.model('User', UserSchema);