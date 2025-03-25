const catchAsync = require("./../utils/catchAsync");
const User = require("./../models/UserModel");

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