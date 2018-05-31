const express = require('express');
const session = require('express-session');
const exphbs  = require('express-handlebars');
const RedisStore = require('connect-redis')(session);

const authURL = process.env.APP_AUTH_MANAGER_URL;

const handlebarsConfig = {
  extname: '.hbs',
  layoutsDir: 'src/resources/views/layouts',
  defaultLayout: 'main',
  helpers: {
    jsonToString: function(json) { return JSON.stringify(json, null, 4); },
    hasRole: function(role, options) {
      return (options.hash.roles.find(o => o.name === role) !== undefined) ? options.fn(this) : options.inverse(this)
    }
  }
};

// Checks if a user is authenticated based on their session and redirects them to login if not
module.exports.checkAuth = function(req, res, next) {
  // If we have a session and we're authenticated, carry on...
  if (req.session !== undefined && req.session.authenticated)
    return next();
  // Otherwise, we redirect off to our authentication manager
  res.redirect(authURL + '/login?redirect=//'+req.headers.host);
};

// Bootstraps our node application
module.exports.setup = function(app, authManager=false) {
  // Setup our public directory
  app.use(express.static('dist'));
  // Don't setup the following routes for the auth manager
  if (!authManager) {
    // Setup setCookie route
    app.get('/setCookie', (req, res) => setCookie(req, res));
    // Setup logout route
    app.get('/logout', (req, res) => res.redirect(authURL + '/logout'));
  }
  // Setup session
  app.use(usaySession());
  // Enable handlebars for templating views
  let hbs = exphbs.create(handlebarsConfig);
  app.engine('.hbs', hbs.engine);
  app.set('view engine', '.hbs');
  app.set('views', 'src/resources/views');
  // Add session and ENV data to all view's data
  app.use(function (req, res, next) {
    res.locals = {
      session: req.session,
      env: process.env
    };
    next();
  });
};

// Sets a cookie on the requesting micro-service frontend based on the cookie data from our auth server
function setCookie(req, res) {

  // If we have a session ID in our query params, use that as our new session ID and redirect to homepage
  if (req.query.cookieID !== undefined) {
    
    res.cookie('usay_session', decodeURIComponent(req.query.cookieID));
    // Now redirect to homepage
    res.redirect('/');

  } else {
    console.log('failed setting session');
  }
}

// Bootstrap our session
function usaySession() {
  return session({
    store: new RedisStore({host: 'redis', port: 6379}),
    secret: 'keyboard cat',
    name: 'usay_session',
    resave: false,
    saveUninitialized: false,
  })
}
