const express = require('express');
const fetchUser = require('../middleware/fetchUser');
const router = express.Router();// imported express
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator'); // this is define for validation of express to give constrains of parameters 


//Endpoint 1) Router1 : add notes using : post "/api/auth/addnotes"
router.post('/addnotes', [
    body('title', 'Enter the your title: ').isLength({ min: 3 }),
    body('description', 'Enter the description : ').isLength({ min: 5 }),
], fetchUser, async (req, res) => {
    // given two things 1) request and 2) response
    try {
        let user = req.user;
        const errors = validationResult(req); // check validation of request
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() }); // if error occur then give this error 
        }
        const { title, description, tag } = req.body;
        const notes = new Note({
            user: user.id,
            title: title,
            description: description,
            tag: tag,
        })
        const savenote = await notes.save();
        res.json({ savenote });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal server error" });
    }

})


//Endpoint 2) Router2 : Get all the Notes using : get "/api/auth/getuser"
router.get('/fetchUsernotes', fetchUser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id })
        res.json(notes);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
})

//Endpoint 3) Router3 : update the notes using : put "/api/auth/updatenotes/:id"
router.put('/updatenotes/:id', fetchUser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        // create new note Object;
        const newnote = {};
        if (title) { newnote.title = title };
        if (description) { newnote.description = description };
        if (tag) { newnote.tag = tag };

        // Find the note by ID and make sure it belongs to the authenticated user
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Note not found");
        }
        console.log(note);
        if (note.user.toString() !== req.user.id) {
            return res.status(403).send("Not allowed to update this note");
        }

        // Update the note and send the updated note as a response
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newnote }, { new: true });
        res.json({note});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

//Endpoint 4) Router4 : delete the notes to be delete using : DELETE "/api/auth/deletenotes" : login required
router.delete('/deletenotes/:id', fetchUser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;

        // Find the note by ID and make sure it belongs to the authenticated user
        let note = await Note.findById(req.params.id);

        console.log(note);
        if (!note) {
            return res.status(404).send("Note not found");
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(403).send("Not allowed to update this note");
        }

        // Update the note and send the updated note as a response
        note = await Note.findByIdAndDelete(req.params.id);
        res.json(Successfully);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router