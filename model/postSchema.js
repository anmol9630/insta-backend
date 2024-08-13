const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    postImg: {
        type:String,
        required:true
    },
    user : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }],
    caption:{
        type:String,
    },
    date:{
        type:Date,
        default:Date.now()
    }
},{timestamps:true})

module.exports = mongoose.model('post' , postSchema);