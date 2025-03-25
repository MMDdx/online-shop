const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    product:{
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    likedAt:{
        type: Date,
        default: Date.now(),
    },
})

likeSchema.index({product:1, user:1}, {unique:true})


const Like = mongoose.model("Like",likeSchema);

module.exports = Like;