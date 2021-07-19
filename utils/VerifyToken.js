var jwt = require('jsonwebtoken');
var config = require('../config');

function VerifyToken(req, res, next) {
  var token = req.headers['authorization'];
  if (!token) {
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  }

  jwt.verify(token, config.secret, function(err, decoded) {
    if (err)
      return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    // if everything good, save to request for use in other routes
    req.username = decoded.id;
    next();
  });
}

function CheckUser(req, res, next) {
  var token = req.headers['authorization'];
  if (!token) {
    req.activeUser = false;
    next();
  } else {

    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) {
        req.activeUser = false;
        next();
      } else {
        // if everything good, save to request for use in other routes
        req.username = decoded.id;
        req.activeUser = true;
        next();
      }
    });
  }
}




module.exports = { VerifyToken, CheckUser };