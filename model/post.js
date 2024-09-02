
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"  // Correct reference to the User model
    },
    date: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
        required: true  // Ensure content is provided
    },
    likes: [
        { 
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"  // Correct reference to the User model
        }
    ]
});

module.exports = mongoose.model('Post', postSchema);  // Capitalized model name




