const { all } = require('../routes/books');
const Book = require('./Book');

class Store {
    constructor() {
        this.books = {};    
    }

    getBooks = function(activeUser) {
        var list = [];
        Object.keys(this.books).forEach((key) => {
            if (activeUser || !this.books[key].restricted) {
                list.push(this.books[key].getListView());                
            } 
        })
        return list;
    }

    getBook = function(id, activeUser) {
        console.log("h");
        if (id in this.books && (activeUser || !this.books[id].restricted)) {
            return this.books[id].getDetailView();
        } else {
            return undefined;
        }
    }

    hasBook = function(id, activeUser) {
        return id in this.books && (activeUser || !this.books[id].restricted);
    }

    getBooksByAuthor = function(author, activeUser) {
        var allBooks = this.getBooks(activeUser)
        return allBooks.filter(book => book.author === author);
    }

    getBooksOrdered = function(orderBy, activeUser) {
        var allBooks = this.getBooks(activeUser);
        allBooks.sort(function(x, y) {
            if (orderBy === "author") {
                return x.author.localeCompare(y.author);
            } else if (orderBy === "title") {
                return x.title.localeCompare(y.title);
            } else {
                if (x.price > y.price) {
                    return -1;
                } else if (x.price < y.price) {
                    return 1;
                 }
                 return 0;
            }
        });
        return allBooks;
    }

    publish = function(author, title, description, price, restricted, res) {
        if (!this.doesBookExist(author, title)) {
            var nextId = parseInt(Math.random()* 8999 + 1000);
            while (! nextId in this.books) {
                nextId = parseInt(Math.random()* 8999 + 1000);
            }
            var book = new Book(nextId, author, title, description, price, restricted);
            this.books[book.id] = book;
            res.status(200).send(book);
        }
        res.status(401).send({"error": "Book already exists"});
    }

    doesBookExist = function(author, title) {
        Object.keys(this.books).forEach((key) => {
            if (this.books[key].author === author && this.books[key].title === title) {
                return true              
            } 
        });
        return false;
    }

    unpublish = function(id) {
        delete this.books[id];
    }

    updateBook = function(id, description, price, restricted) {
        this.books[id].description = description;
        this.books[id].price = parseFloat(price);
        this.books[id].restricted = restricted;
    }

    setInitialBookList = function() {
        this.books = {
            1234: new Book(1234,"yoda","Do or Do Not", genericDesc(), "10.99", false),
            2444: new Book(2444,"yoda","A Memoir", genericDesc(), "15.00", false),
            1144: new Book(1144,"yoda","There Is No Try", genericDesc(), "10.00", true),
            8993: new Book(8993, "luke", "Rebellion 101", genericDesc(), "1.00", false),
        };
    }
}

genericDesc = function() {
    return "Lorem ipsum dolor sit amet, consectetur adipiscing elit,"
    + "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " 
    + "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris "
    + "nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in "
    + "reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla "
    + "pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
}


module.exports = Store;