const User = require('./../models/UserModel');
const catchAsync = require('./../utils/catchAsync');
const Email = require('./../utils/email');
const jwt = require("jsonwebtoken")
const AppError = require('../utils/AppError');
const crypto = require("crypto")
const {promisify} = require('util');
const signToken = id =>{
    return  jwt.sign({id: id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN})
}

const createSendToken = (user,statusCode,res)=>{
    const token = signToken(user._id)
    const cookie_options = {
        expiresIn: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 *60 *60 * 1000),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === 'production') {
        cookie_options.secure = true
    }
    user.password = undefined
    res.cookie('jwt', token, cookie_options)
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}



exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
    })

    createSendToken(newUser, 200, res);

})

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body
    if (!email || !password) {
        return next(new AppError("email and password are required!"));
    }

    const user = await User.findOne({email: email}).select("+password");
    if (!user || !(await user.comparePassword(password, user.password))) {
        return next(new AppError("incorrect email or password!", 400));
    }

    createSendToken(user, 200, res);
})

// protect
exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    else if(req.cookies && req.cookies.jwt){
        token = req.cookies.jwt
    }
    else {
        console.log(req.cookies);
        return next(new AppError("please login first!", 400));
    }

    let decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET).catch(next)
    if (!decoded) return next(new AppError("incorrect token!", 401));
    // checking if user still exists!
    const current_user = await User.findById(decoded.id);
    // check user didnt changed password after token was issued
    if (current_user.changedPasswordAfter(decoded.iat)){
        return next(new AppError("user recently changed password! please login again"))
    }
    // everything is ok!
    req.user = current_user;

    next();
})

exports.logOut = (req,res) => {
    res.cookie('jwt', "LoggedOut", {
        httpOnly: true,
        expires: new Date(Date.now() + 10000)
    });
    res.status(200).json({status: 'success'})
}

exports.forgotPassword = catchAsync(async (req,res,next) => {
    if (!req.body.email) return next(new AppError("email is required!"));

    const user = await User.findOne({email: req.body.email}).select("+password");
    if (!user) return next(new AppError("incorrect email!", 400));

    const resetToken = user.createPasswordResetToken()
    await user.save({validateBeforeSave: false})

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    try{
        console.log(user.email)
    await new Email(user,resetURL).sendWelcome();
    res.status(200).json({status: 'success',
    message: 'token sent successfully to your Email!'
    })

    }catch (err){
        res.status(400).json({status: 'error',
        message: err.message})
        console.log(err)
    }

})

exports.resetPassword = catchAsync(async (req,res,next) => {
    const resetToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({PasswordResetToken: resetToken , passwordResetExpires: {$gt: Date.now()}})

    if (!user) return next(new AppError("incorrect token!", 401));

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.PasswordResetToken = undefined
    user.passwordResetExpires = undefined

    await user.save();
    createSendToken(user, 200, res);

})

exports.updatePassword = catchAsync(async (req,res,next) => {

    const user = await User.findById(req.user.id).select("+password");
    const password = req.body.currentPassword;
    if (!user || ! (await user.comparePassword(password, user.password))){
        return next(new AppError("user Does not exists or current password is Wrong!", 401));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();
    const signed_token = signToken(user.id)
    res.status(200).json({
            status: 'success',
            token: signed_token
        }
    )
})

exports.restrictTo = (...allowedOnes) => {

    return (req, res, next) => {
        if (!allowedOnes.includes(req.user.role)) return next(new AppError("You are not allowed!", 401));
        next();
    }
}
