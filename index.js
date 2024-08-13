const express = require('express')
const cors = require('cors')
const expressSession = require('express-session');
const passport = require('passport')
const localStategy = require('passport-local')
const Users = require('./model/userSchema');
const {upload} = require('./multer');
const app  = express();
const fs = require('fs');
const mongoose = require('mongoose');
const Posts = require('./model/postSchema');

mongoose.connect('mongodb+srv://ayush:ayush@cluster0.gpekoyl.mongodb.net/newInsta')

app.use(cors());

app.use(expressSession({
    resave:false,
    saveUninitialized:false,
    secret: 'keyboard cat',
}))
app.use('/uploads', express.static('uploads'))

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());
passport.use(new localStategy(Users.authenticate()));

app.use(express.json());


app.get('/', (req, res) => {
    res.send('user Logged in')
})

app.post('/signup' , (req,res,next) => {

    const { name, username, email, password} = req.body

    const newUser = {
        name,email,username
    }

    console.log(req.body);
    Users.register(newUser , password).then(() => {
        passport.authenticate('local')(req,res,() => {
            res.status(200).send('user signed up')
        })
    }).catch(err => {
        res.status(400).send(err.message)
    })
})



app.post('/login', passport.authenticate('local'), (req, res) => {
    // If authentication is successful, send a success response
    res.send({ message: 'Login successful'});
  });
  
  app.get('/logout', (req, res) => {
    req.logout(); // Passport.js middleware to logout
    res.send({ message: 'Logout successful' });
  });

app.post('/profileData' , async (req,res) => {
    const {username} = req.body;
    const data = await Users.findOne({username}).populate('posts')
    console.log(data);
    res.json(data);
})

app.post('/search' , async(req,res) => {
    const {search} = req.body;
    if(search){
        const users = await Users.find({username: new RegExp('^'+search, 'i')}).populate('posts');
        res.send(users)
    }
    else{
        res.send([])
    }
})

app.post('/editProfile' , async(req,res) => {
    const {username,name,bio,oldUser} = req.body
        const user = await Users.findOneAndUpdate({username:oldUser} , {username,name,bio},{new:true})
        res.send(user)
})

app.post('/uploadImage' ,upload.single('image'), async (req,res) => {
    const {username} = req.body;
    const user = await Users.findOneAndUpdate({username} , {profileImg:req.file.path},{new:true})
    res.send(user.profileImg)
})


app.post('/uploadPost' , upload.single('image') , async(req,res) => {
    const {username,caption} = req.body;
    const user = await Users.findOne({username});
    const newPost = new Posts({
        postImg:req.file.path,
        user:user._id,
        caption
    })
    await newPost.save(); 
    user.posts.push(newPost._id);
    await user.save();
    res.send(user);  
})

app.post('/getFeedData' ,async (req,res) => {
    const {username} = req.body;
    // console.log(username);
    // const user = await Users.findOne({username}) .populate({
    //     path: 'followers',
    //     populate: { path: 'posts' } 
    // })
    // console.log(user);
    const posts = await Posts.find({}).populate('user').sort({_id : -1});
    
    res.json({posts});
})

app.post('/getUserId' , async (req , res) => {
    const re = await Users.findOne({username:req.body.username})
    const id = re._id;
    res.send(id);
})

app.post('/likePost' ,async (req,res) => {
    const {username,postId} = req.body;
    const post = await Posts.findOne({_id:postId}).populate('likes')
    // 
    // console.log(post.likes)
    const likes = post.likes
    // console.log(likes)
    const findlikes = (e) => e._id == username
    const isLiked = likes.findIndex(findlikes)
    // console.log(username)
    // console.log(isLiked);
    if(isLiked == -1){
        post.likes.push(username);
        await post.save();
    }
    else{
        post.likes.splice(isLiked, 1)
        await post.save(); 
    }
    res.send(post);
   
})


app.post('/addFriend' , async(req,res) => {
    const {username,addUser} = req.body;
    console.log(username,addUser);
    const data = await Users.findOne({username}).populate('posts');
    const isFriend = data.follwings.findIndex((e) => e._id==addUser);
    const secUser = await Users.findById(addUser).populate('posts');
    console.log(isFriend);
    if(isFriend == -1){
        data.follwings.push(addUser);
        secUser.followers.push(data._id);
    }
    else{
        data.follwings.splice(isFriend , 1);
        const infoll = secUser.followers.findIndex((e) => e == data._id);
        secUser.followers.splice(infoll,1);
    }
    await data.save();
    await secUser.save();
    console.log(secUser);
    res.send({data,secUser});
})

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})