import express from 'express';
import jwt from 'jsonwebtoken';

import config from '../config';

import User from './users/server/models';

import users from './users/server/routes';

const apiRoutes = express.Router();

// route to api (GET http://localhost:3000/api)
apiRoutes.get('/', function(req, res, next) {
  return res.json({
    'success': true,
    'message': 'This is a base API GET request',
    'auth a user': 'POST ' + config.API_URL + 'api/auth',
    'users': {
      'get all users': 'GET ' + config.API_URL + 'users',
      'create a user': 'POST ' + config.API_URL + 'users',
      'get a user': 'GET ' + config.API_URL + 'users/_id',
      'update a user': 'PUT ' + config.API_URL + 'users/_id',
      'delete a user': 'DELETE ' + config.API_URL + 'users/_id'
    }
  });
});

// route to authenticate a user (POST http://localhost:3000/api/auth)
apiRoutes.post('/auth', function(req, res) {
  // find the user
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;
    if (!user) {
      return res.json({
        success: false,
        message: 'Authentication failed. User not found.'
      });
    } else if (user) {
      // check if password matches
      if (!user.validPassword(req.body.password)) {
        return res.json({
          success: false,
          message: 'Authentication failed. Wrong password.'
        });
      } else {
        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, config.JWT.SECRET, {
          expiresIn: config.JWT.EXPIRES
        });
        // return the information including token as JSON
        return res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }
    }
  });
});

// route middleware to verify a token
apiRoutes.use(function(req, res, next) {
  // check header for token
  var token = req.headers['x-access-token'];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, config.JWT.SECRET, function(err, decoded) {
      if (err) {
        return res.json({
          success: false,
          message: 'Failed to authenticate token.'
        });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.json({
      success: false,
      message: 'No token provided.'
    });
  }
});

apiRoutes.use('/users', users);

module.exports = apiRoutes;
