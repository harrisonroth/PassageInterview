var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var { VerifyToken } = require('../utils/VerifyToken');
var config = require('./../config');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var Users = 
	{
		"logharra" : bcrypt.hashSync("chewbacca", 8),
		"luke" : bcrypt.hashSync("skywalker", 8),
		"yoda" : bcrypt.hashSync("feeltheforce", 8),
	}

router.get('/list', function(req, res) {
	console.log(Object.keys(Users));
	res.status(200).send({"users" : Object.keys(Users)});
});

router.post('/signup', function(req, res) {
	if (req.body.username &&
		  req.body.password) {
		if (Users[req.body.username]) {
			return res.status(401).send({"error": "User already exists"});
		}
		var hashedPassword = bcrypt.hashSync(req.body.password, 8);
		Users[req.body.username] = hashedPassword;
		console.log("Added " + req.body.username);
		var token = jwt.sign({ id: req.body.username }, config.secret, {
		expiresIn: "1h" // expires in one hour
		});
		res.status(200).send({ token: token, userId: req.body.username });
	} else {
		return res.status(401).send({"error": "missing data"});
	}
});

router.post('/login', function(req, res) {
	if (req.body.username &&
		  req.body.password) {
			authenticate(req.body.username, req.body.password, function(err, username) {	
			if(err) {
				return res.status(500).send(err);
			}
			var token = jwt.sign({ id: username }, config.secret, {
	      		expiresIn: "1h" // expires in 1hour
			});
			returnData = { token: token };
			return res.status(200).send(returnData);
		});
	} else {
		return res.status(401).send({"error": "missing data"});
	}

});

router.get('/refresh', VerifyToken, function(req, res) {
	console.log("refresh token for: " + req.username);
	var token = jwt.sign({ id: req.username }, config.secret, {
		expiresIn: "1h" // expires in 1hour
	});
	returnData = { token: token, userId: req.username};
	return res.status(200).send(returnData);
	
});

function authenticate(username, password, callback) {
	var expectedPassword = Users[username];
	if (expectedPassword) {
		bcrypt.compare(password, expectedPassword, function (err, result) {
			if (result === true) {
				return callback(null, username);
			} else {
				var err = new Error('Incorrect password.');
				err.status = 402;
				err.error = "Password didn't match"
				return callback(err);
			}
		});
	} else {
		var err = new Error('User does not exist.');
		err.status = 402;
		err.error = "User does not exist";
		return callback(err);
	}
}

module.exports = router;
