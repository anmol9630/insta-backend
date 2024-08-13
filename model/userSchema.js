const mongoose = require('mongoose');

const plm = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
    name: {type:String, required: true},
    email: {type:String, required: true},
    password: String,
    username: {type:String, required: true,unique:true},
    bio: {
        type:String,
        default:'',
    },
    posts:[{type: mongoose.Schema.Types.ObjectId, ref: 'post'}],
    followers:[{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    follwings:[{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    profileImg:{
        type:String,
        default:'uploads/default.png',
    }
});

userSchema.plugin(plm);
module.exports = mongoose.model('user', userSchema)