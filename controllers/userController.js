const catchAsync = require("./../utils/catchAsync");
const User = require("./../models/UserModel");
const AppError = require("./../utils/AppError");

const filterBody = (obj, ...allowedFields) => {
    const newObj = {}
    allowedFields.map(el => newObj[el] = obj[el]);
    return newObj;
}


exports.me = catchAsync(async (req, res, next) => {
    const current_user = await User.findById(req.user.id).select("-password -active");
    console.log(current_user)
    res.status(200).json({
        status: "success",
        user: current_user,
    })
})

exports.deleteMe = catchAsync(async (req,res,next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false})

    res.status(204).json({
        status: "success",
    })
})

exports.updateMe = catchAsync(async (req,res,next) => {
    let filtered = filterBody(req.body, "email", "name")
    const user = await User.findByIdAndUpdate(req.user.id, filtered,{
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        status: "success",
        user,
    })
})

exports.getAll = catchAsync(async (req,res,next) => {
    const All = await User.find()

    res.status(200).json({
        status: "success",
        all: All,
    })
})

exports.activateSubscription = catchAsync(async (req,res,next) => {
    const subscription = req.params.name;
    const user = req.user;
    const subList = ["1-month", "3-month", "6-month"]
    if (!subList.includes(subscription)) return next(new AppError("not a valid subscription", 400));

    user.isSubscribed = true;
    user.subscriptionName = subscription;
    user.subscriptionStart = new Date();

    const months = parseInt(subscription.split("-")[0]);
    const now = new Date();
    const subscriptionEnd = new Date(now);
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + months);

    user.subscriptionEnd = subscriptionEnd;

    await user.save({validateBeforeSave: false});
    return res.status(200).json({
        status: "success",
        message: `your ${subscription} subscription was activated!`
    })
})
