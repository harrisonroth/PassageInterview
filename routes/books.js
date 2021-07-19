var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var {CheckUser,VerifyToken} = require('../utils/VerifyToken');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const Store = require('../objects/Store');
const Book = require('../objects/Book');
const bookStore = new Store();
bookStore.setInitialBookList();

router.get('/list', CheckUser, function(req, res) {
    res.status(200).send(bookStore.getBooks(req.activeUser));
});

router.get('/list/author/:author', CheckUser, function(req, res) {
    res.status(200).send(bookStore.getBooksByAuthor(req.params.author, req.activeUser));
});

router.get('/list/orderBy/:orderBy', CheckUser, function(req, res) {
    if (req.params.orderBy === "author" || req.params.orderBy === "title"|| req.params.orderBy === "price") {
        res.status(200).send(bookStore.getBooksOrdered(req.params.orderBy, req.activeUser));
    } else {
        res.status(402).send({"error": "Can only order by author, title, or price"});
    }    
});

router.get('/detail/:bookId', CheckUser, function(req, res) {
    if (bookStore.hasBook(req.params.bookId, req.activeUser)) {
        res.status(200).send(bookStore.getBook(req.params.bookId, req.activeUser));
    } else {
        res.status(402).send({"error": "Can't find book with id " + req.params.bookId});
    }
});

router.post('/publish', VerifyToken, function (req, res) {
     if (req.body.author && req.body.title && req.body.description && req.body.price) {
        if (req.body.author === req.username) {
            bookStore.publish(req.body.author, req.body.title, req.body.description, req.body.price, (req.body.restricted) ? req.body.restricted : false, res);
        } else {
            res.status(401).send({"error": "We only allow self publishing. The author must be your username."});

        }
     } else {
        res.status(401).send({"error": "missing required data"});
     }
});

router.post('/unpublish/:bookId', VerifyToken, function (req, res) {
    var book = bookStore.getBook(req.params.bookId, true);
    if (book) {
        if (book.author === req.username) {
            bookStore.unpublish(req.params.bookId);
            res.status(200).send({"msg": "Book removed from store"});
        } else {
            res.status(401).send({"error": "You can only unpublish your own books."});
        }
    } else {
        res.status(402).send({"error": "Book doesn't exist"});
    }
});

router.post('/update/:bookId', VerifyToken, function (req, res) {
    var book = bookStore.getBook(req.params.bookId, true);
    if (book) {
        if (book.author === req.username) {
            if (req.body.description || req.body.price || req.body.restricted) {
                bookStore.updateBook(req.params.bookId, (req.body.description) ? req.body.description : book.description,
                    (req.body.price) ? req.body.price : book.price, 
                    (req.body.restricted) ? req.body.restricted : book.restricted, res);
                res.status(200).send({"msg": "Book updated"});
            } else {
                res.status(401).send({"error": "missing required data"});
            }
        } else {
            res.status(401).send({"error": "We only allow self publishing. The author must be your username."});
        } 
    }
});

module.exports = router;