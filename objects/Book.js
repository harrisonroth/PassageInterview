class Book {
    constructor(id, author, title, description, price, restricted) {
        this.id = id;
        this.author = author;
        this.title = title;
        this.description = description;
        this.price = parseFloat(price);
        // Only active users can see restricted books
        this.restricted = restricted;
    }

    getListView = function () {
        return {
            "id": this.id,
            "author": this.author,
            "title": this.title,
            "price": this.price,
            "description": this.description.substr(0,40)
        }
    }

    getDetailView = function () {
        return {
            "id": this.id,
            "author": this.author,
            "title": this.title,
            "price": this.price,
            "description" : this.description
        }
    }
}

module.exports = Book;