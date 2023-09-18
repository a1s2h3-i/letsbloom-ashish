// Import required modules and middleware
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
var fetchUser = require('../middleware/fetchUser');

// Import the Book model (assuming it's defined elsewhere in the code)
const Book = require('../models/Book');

// Endpoint 1) Router1: Add books using POST "/api/auth/addbook" - To add a recent book to the library
router.post('/addbook', [
    // Request body validation rules using express-validator
    body('name', 'Enter the Name of the book: ').isLength({ min: 1 }),
    body('authorname', 'Enter the Name of the author: ').isLength({ min: 2 }),
    body('version', 'Enter the version of the book: ').isLength({ min: 1 }),
    body('category', 'Enter the category of the book: ').isLength({ min: 2 }),
    body('prize', 'Enter the prize of the book: ').isLength({ min: 2 }),
], fetchUser, async (req, res) => {
    try {
        let user = req.user; // Fetch the authenticated user from the request (provided by fetchUser middleware)
        const errors = validationResult(req); // Check for validation errors in the request
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() }); // If validation errors, return them in the response
        }
        // Extract book details from the request body
        const { name, authorname, version, category, prize } = req.body;

        // Create a new Book instance based on the Book model
        const book = new Book({
            user: user.id, // Assign the user's ID to the book's "user" field
            name: name,
            authorname: authorname,
            version: version,
            category: category,
            prize: prize,
        });

        // Save the book to the database
        const savedBook = await book.save();

        // Send the saved book details in the response
        res.json({ book: savedBook });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Endpoint 2) Router2: Get details of the user with renewed books using GET "/api/auth/fetchUserbook"
// It gives all information about a user who renewed a book with the book details.
router.get('/fetchUserbook', fetchUser, async (req, res) => {
    try {
        const books = await Book.find({ user: req.user.id });
        res.json(books);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint 3) Router3: Update the book version using PUT "/api/books/updatebook/:id"
router.put('/updatebook/:id', fetchUser, async (req, res) => {
    try {
        const { prize, version } = req.body;
        // create new book Object;
        const newbook = {};
        if (prize) { newbook.prize = prize };
        if (version) { newbook.version = version };

        // Find the book by ID and make sure it belongs to the authenticated user
        let book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).send("Book not found");
        }
        console.log(book);
        if (book.user.toString()!== req.user.id) {
            return res.status(403).send("Not allowed to update this book");
        }

        // Update the book and send the updated book as a response
        book = await Book.findByIdAndUpdate(req.params.id, { $set: newbook }, { new: true });
        res.json({ book });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.delete('/deletebook/:id', fetchUser, async (req, res) => {
    try {
        // Find the book by ID and make sure it belongs to the authenticated user
        let book = await Book.findById(req.params.id);
        
        console.log(book);
        if (!book) {
            return res.status(404).send("Book not found");
        }
        if (book.user.toString() !== req.user.id) {
            return res.status(403).send("Not allowed to delete this book");
        }

        // Delete the book and send a success message as a response
        book = await Book.findByIdAndDelete(req.params.id);
        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;
