const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/thinkingProject', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true  // Ensure unique email addresses
    },
    password: {
        type: String,
        required: true
    },

    profileimg:{
        type: String,
        default:"default.png"

    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"  // Correct reference to the Post model
    }]
});

module.exports = mongoose.model('User', userSchema);  // Capitalized model name
