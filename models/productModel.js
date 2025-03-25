const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "product should have a Name!"],
        unique: [true, "product with that name already exists!"],
    },
    price: {
        type: Number,
        required: [true, "product should have a Price!"],
    },
    Distributors:{
        type: [String],
    },
    coverPhoto:{
        type: String,
        required: [true, "product should have a Cover Photo!"],
    },
    photos:{
        type: [String],
    },
    ratingsAverage:{
        type: Number,
        default: 3,
        min: [0,"must be greater than 0"],
        max: [5, "must be lower than 5"],
        set: val => Math.round((val*10))/10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    enable:{
        type: Boolean,
        default: true
    },
    slug:{
        type: String
    }

},{
    toObject: {virtuals: true},
    toJSON: {virtuals: true},
})

productSchema.pre("save", function (next) {
    this.slug = slugify(this.name,{ lower:true});
    next()
})

productSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "product",
    localField: "_id"
})


const ProductModel = mongoose.model("Product",productSchema);

module.exports = ProductModel;
