const Review = require('./../models/reviewModel');
const FactoryController = require('./FactoryController');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');

exports.createReview = FactoryController.createOne(Review);
exports.getAllReviews = FactoryController.getAll(Review);
exports.getReview = FactoryController.getOne(Review);
exports.updateReview = FactoryController.updateOne(Review)

exports.createReviewOnUser = catchAsync(async (req, res, next) => {
    const review = await Review.create({
        product: req.body.product,
        review: req.body.review,
        rating: req.body.rating,
        user: req.user.id
    })

    if (!review) {
        return next(new AppError("failed to submit review!", 400));
    }
    return res.status(201).json({
        status: "success",
        data: review
    })
})

exports.deleteReview = catchAsync(async (req,res,next) => {
    if (req.user.role === "user"){
        let review = await Review.findOneAndDelete({_id: req.params.id, user: req.user.id});
        if (!review) {
            return next(new AppError("did not found!!", 404));
        }
        console.log("user...")
        return res.status(204).json({
            status: "success",
        })
    }
    else {
        let review = await Review.findByIdAndDelete(req.params.id)
        if (!review) {
            return next(new AppError("did not found!", 404));
        }
        return res.status(204).json({
            status: "success",
        })
    }
})
// do this in factory?

// review will be deleted when its owner wants to delete it or the admin's wants it to
exports.getReviewsOnProduct = catchAsync(async (req,res,next) => {
    const revs = await Review.find({product: req.params.product})
    return res.status(200).json({
        status: "success",
        Num: revs.length,
        data: revs
    });

})

