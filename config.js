'use strict';

const cfg = {};

// HTTP port
cfg.port = process.env.PORT || 3000;

// a random string that will help generate secure one-time passwords and HTTP sessions
cfg.secret = process.env.APP_SECRET || '42';

// Twilio account SID, auth token and number
cfg.accountSid = process.env.TWILIO_ACCOUNT_SID;
cfg.authToken = process.env.TWILIO_AUTH_TOKEN;
cfg.twilioNumber = process.env.TWILIO_NUMBER;

// MongoDB connection
// MONGO_URL for local dev
// MONGOLAB_URI for deployment
cfg.mongoUrl = process.env.MONGOLAB_URI || process.env.MONGO_URL;

// export configuration object
module.exports = cfg;