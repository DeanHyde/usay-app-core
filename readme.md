# Usay NodeJS Core for Front-ends

This package will serve as a package for common features shared across our NodeJS front-end applications.

# What does it provide?

## Authentication Middleware

Authentication middleware is provided out of the box. To make use of the middleware on your routes, you can do the following:

```js
// Require our package
const usay = require('usay-auth-middleware');

// Create a protected route
app.get('/', usay.checkAuth, (req, res) => { res.send("I'm protected!") });

// Create an unprotected route
app.get('/foo', usay.checkAuth, (req, res) => { res.send("I'm open to the world!") });
```

For the authentication middleware to work correctly, you must also setup a route that will handle the redirect back from our authentication server. To do this, simply setup an unprotected `/setToken` route that calls the `usay.setToken()` function like this:

```js
// This is set to handle the redirect back from the auth manager
app.get('/setToken', (req, res) => usay.setToken(req, res));
```

## Session Setup

The package also provides a very simple way of getting up and running with redis sessions. Setup your session like so:

```js
// Require our package
const usay = require('usay-auth-middleware');

// Initialise the session (if you're using express.static(), it should be above this statement as to not cause issues)
app.use(usay.session());

// Test if it's working on a protected route so we'll have session data to display
app.get('/session-test', usay.checkAuth, (req, res) => { console.log(req.session) });
```