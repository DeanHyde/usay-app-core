const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

module.exports.session = function() {
  return session({
    store: new RedisStore({host: 'redis', port: 6379}),
    secret: 'keyboard cat',
    name: 'usay_session',
    resave: false,
    saveUninitialized: false,
  })
}

// Used for our public routes
const openRouter = express.Router();

openRouter.get('/setCookie', function (req, res) {
  // If we have a session ID in our query params, use that as our new session ID and redirect to homepage
  if (req.query.cookieID !== undefined) {
    
    res.cookie('usay_session', decodeURIComponent(req.query.cookieID));
    // Now redirect to homepage
    res.redirect('/');

  } else {
    console.log('failed setting session');
  }
});

module.exports.open = openRouter;

// Used for routes that require the user be authenticated
const authRouter = express.Router();

authRouter.use(function(req, res, next) {
  // If we have a session and we're authenticated, carry on...
  if (req.session !== undefined && req.session.authenticated)
    return next();
  // Otherwise, we redirect off to our authentication manager
  res.redirect(process.env.APP_AUTH_MANAGER_NODE_URL + '/login?redirect='+process.env.APP_URL);
});

module.exports.auth = authRouter;