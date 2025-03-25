const mongoose = require('mongoose');
const Product = require('./productModel');
const {encodeXText} = require("nodemailer/lib/shared");

const reviewSchema = new mongoose.Schema({
    review:{
        type: String,
        required: [true, 'Review is required'],
    },
    rating:{
        type: Number,
        required: [true, "review should have a Rating!"],
        min:0,
        max: 5
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true,
    }
})
reviewSchema.index({product: 1, user: 1}, {unique: true});

reviewSchema.pre(/^find/, function (next){
    this.populate({
        path: 'user',
        select: "name photoCover -__v"
    });
    next();
})


reviewSchema.statics.calcAverageRating = async function (productId){
    const stats = await this.aggregate([
        {
            $match: {product: productId}
        },
        {
            $group:{
                _id: '$product',
                nRating: { $sum: 1},
                avgRating: { $avg: '$rating' },
            }
        }
    ])

    if (stats.length > 0){
        await Product.findByIdAndUpdate(productId, {
            ratingsAverage: stats[0].avgRating,
            ratingsQuantity: stats[0].nRating
        })
    }
}

reviewSchema.post("save", function () {
    this.constructor.calcAverageRating(this.product);
})

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: "user",
        select:"name photoCover",
    })
    next();
})

reviewSchema.pre(/^findOneAnd/, async function (next) {
    // points to current doc
    // console.log(this.getQuery());
    this.r = await this.model.findOne(this.getQuery());
    next();
})

reviewSchema.post(/^findOneAnd/, async function () {
    // this.r = await this.findOne() Does not work here, query has already executed
    if (!this.r) return
    this.r.constructor.calcAverageRating(this.r.product)
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;