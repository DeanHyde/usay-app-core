const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const authURL = process.env.APP_AUTH_MANAGER_URL;

module.exports.checkAuth = function(req, res, next) {

  // If we have a session and we're authenticated, carry on...
  if (req.session !== undefined && req.session.authenticated)
    return next();
  // Otherwise, we redirect off to our authentication manager
  res.redirect(authURL + '/login?redirect=//'+req.headers.host);
}

module.exports.setup = function(app) {
  // Setup setCookie route
  app.get('/setCookie', (req, res) => setCookie(req, res));
  // Setup logout route
  app.get('/logout', (req, res) => res.redirect(authURL+'/logout'));
  // Setup session
  app.use(usaySession());
}

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

function usaySession() {
  return session({
    store: new RedisStore({host: 'redis', port: 6379}),
    secret: 'keyboard cat',
    name: 'usay_session',
    resave: false,
    saveUninitialized: false,
  })
}
