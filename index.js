
const mongoose = require('mongoose'); 
const express = require('express');
const app = express();
const path = require('path');
const Usermodel = require('./model/user');
const Postmodel = require('./model/post');
const router = express.Router();
const uploadimg = require('./utills/multer');



const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));




 

app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(cookieParser());

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/registration', function (req, res) {
    res.render('registration');
});



app.post('/post', isLoggedIn, async function (req, res) {
    try {
        // Log the request body to ensure data is coming through
        console.log('Request body:', req.body);
        
        let user = await Usermodel.findOne({ email: req.user.email }).populate("posts");
        
        if (!user) {
            throw new Error("User not found");
        }

        let { content } = req.body;

        if (!content) {
            return res.status(400).send("Content is required");
        }

        // Create the post
        let post = await Postmodel.create({
            user: user._id,
            content
        });

        user.posts.push(post._id);
        await user.save();

        res.redirect('/profile');
    } catch (error) {
        console.error("Error in creating post:", error);  // Log the error for debugging
        res.status(500).send("Internal Server Error");
    }
});



app.get('/userimg', isLoggedIn, async function (req, res) {
    console.log('User in profile route:', req.user);
    let user = await Usermodel.findOne({ email: req.user.email }).populate("posts");
    res.render('userimg', { user });
});

app.post('/userimg', isLoggedIn, uploadimg.single("profileimg"), async function (req, res) {
    try {
        // Ensure req.user is defined
        if (!req.user || !req.user.email) {
            throw new Error('User is not logged in or email is missing');
        }

        let user = await Usermodel.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).send("User not found");
        }

        if (req.file) {
            user.profileimg = req.file.filename;
        }
        user.name = req.body.name;
        user.email = req.body.email;
        await user.save();

        // Redirect to a different page after updating email and name
        res.redirect('/profile');  // or any other route you want to redirect to
    } catch (error) {
        console.error("Error in updating user:", error);
        res.status(500).render('error', { message: "An error occurred", error });
    }
});



















app.get('/profile', isLoggedIn, async function (req, res) {
    console.log('User in profile route:', req.user);
    let user = await Usermodel.findOne({ email: req.user.email }).populate("posts");
    res.render('profile', { user });
});






app.post('/likes/:id', isLoggedIn, async function (req, res) {
    try {
        const postId = req.params.id;

        // Log the ID to see what is being passed
        console.log('Post ID received:', postId);

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            console.error("Invalid post ID:", postId);
            return res.status(400).render('error', { message: "Invalid Post ID" });
        }

        let post = await Postmodel.findOne({ _id: postId }).populate("user");
        if (!post) {
            console.error("Post not found for ID:", postId);
            return res.status(404).render('error', { message: "Post not found" });
        }

        console.log(req.user.userId + " logged-in user ID");

        // Like or unlike the post
        if (post.likes.indexOf(req.user.userId) === -1) {
            post.likes.push(req.user.userId);
        } else {
            post.likes.splice(post.likes.indexOf(req.user.userId), 1);
        }

        await post.save();

        let user = await Usermodel.findOne({ _id: req.user.userId }).populate("posts");
        res.redirect('/profile'); // Redirect to profile or another appropriate page
    } catch (error) {
        console.error("Error in like/unlike post:", error);
        res.status(500).render('error', { message: "Internal Server Error" });
    }
});




 
        

  app.get('/edit/:id', isLoggedIn, async function (req, res) {
     try {
        let post = await Postmodel.findOne({ _id: req.params.id }).populate("user");
        if (!post) {
            return res.status(404).send('Post not found');
           }
            res.render("edit", { post });
            } catch (error) {
            res.status(500).send('Server error');
            }
        
        });
        


        app.post('/update/:id', isLoggedIn, async function (req, res) {
            try {
                await Postmodel.findOneAndUpdate({ _id: req.params.id }, { content: req.body.content });
                res.redirect('/profile');
            } catch (error) {
                res.status(500).send('Server error');
            }
        });





  





















































// Attach the router to the app
app.use('/', router); 






app.get('/login', function (req, res) {
    res.render('login');
});



app.post('/registration', async function(req, res){
    let { name, email, username, password } = req.body;

    let user = await Usermodel.findOne({ email });
    if(user){
        return res.status(409).send("User already registered");
    }

    bcrypt.genSalt(10, function(err, salt){
        if (err) return res.status(500).send("Error in salting");

        bcrypt.hash(password, salt, async function(err, hash){
            if (err) return res.status(500).send("Error in hashing");

            let createuser = await Usermodel.create({
                username,
                name,
                email,
                password: hash
            });
            
            let token = jwt.sign({ email: email, userId: createuser._id }, "sha");
            res.cookie("token", token);
            res.redirect('/login');
        });
    });
});











app.post('/login', async function(req, res) {
    let { email, password } = req.body;

    let user = await Usermodel.findOne({ email });
    if (!user) {
        return res.status(404).send("User not registered");
    }

    bcrypt.compare(password, user.password, function(err, result) {
        if (err || !result) {
            return res.status(401).send("Incorrect password");
        }

        let token = jwt.sign({ email: user.email, userId: user._id }, "sha");
        res.cookie("token", token, { httpOnly: true }); // Ensure token is set correctly
        console.log('Token set in cookie:', token);
        res.redirect('/profile');
    });
});




















app.get('/logout', async function (req, res) {
    res.cookie("token", ''); 
    res.redirect('/login');
});
















function isLoggedIn(req, res, next) {
    if (!req.cookies.token) {
        console.error('No token found in cookies');
        return res.status(401).redirect("/login");  // Use status 401 for unauthorized
    }

    try {
        let data = jwt.verify(req.cookies.token, "sha");
        console.log('Decoded token data:', data);
        req.user = data;
        next();  // Proceed to the next middleware or route handler
    } catch (err) {
        console.error('Token verification failed:', err);
        return res.status(401).send("Invalid token");
    }
}


app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
  






app.listen(3000, function () {
    console.log('Server is running on port 3000');
});











