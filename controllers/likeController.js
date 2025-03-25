const Like = require('./../models/LikeModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./../controllers/FactoryController');
const AppError = require("./../utils/AppError");
const {all} = require("express/lib/application");

exports.createLike = catchAsync(async (req, res, next) => {
    await Like.create({
        product: req.body.product,
        user: req.user.id,
    })
    res.status(200).json({
        status: "success"
    })
})
// exports.getAllLikes = factory.getAll(Like);

exports.deleteLike = catchAsync(async (req,res,next) => {
    const like = await Like.findOneAndDelete({product: req.params.product, user: req.user.id})
    if(!like){
        return next(new AppError("invalid product Id or its not yours!", 400))
    }
    return res.status(204).json({
        status: "success",
    })
})


exports.getAllLikesOnProduct = catchAsync(async (req,res,next) => {
    const allLikes = await Like.find({product: req.params.product});
    res.status(200).json({
        status: "success",
        Num: allLikes.length,
        data: allLikes
    })

})