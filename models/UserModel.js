const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require("crypto")
const validator = require('validator')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "user should have a name"]
    },
    email:{
        type: String,
        required: [true, "user should have a email address"],
        unique: [true, "user should have a unique email address"],
        validate: [validator.isEmail, "not a valid email address!"]
    },
    password: {
        type: String,
        required: [true, "user should have a Password"],
        minLength: [8, "password should be at least 8 characters"],
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, "user should have a Confirm Password"],
        validate: {
            // this only works only on SAVE AND CREATE!
            validator: function (val){
                return val === this.password
            },
            message: "confirm password is not equal to password!"
        }
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    joinedAt:{
        type: Date,
        default: Date.now(),
        select: false
    },
    passwordChangedAt:{
        type: Date,
    },
    role:{
        type: String,
        default: 'user',
        enum: ['user','admin', "blogger"],
        select: false
    },
    PasswordResetToken:{
        type: String,
    },
    passwordResetExpires: String,

    photoCover:{
        type: String,
        default: "default.jpg"
    },
    isSubscribed: {
        type: Boolean,
        default: false,
    },
    subscriptionName: {
        type: String,
        enum: ["1-month", "3-month", "6-month"],
    },
    subscriptionStart: Date,
    subscriptionEnd: Date

},{
    toObject: {virtuals: true},
    toJSON: {virtuals: true},
})

// query middleware
userSchema.pre(/^find/, function (next) {
    this.find({active: {$ne: false}})
    this.select("-__v")
    next();
})
// doc middleware
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next()
})

userSchema.pre('save', function (next){
    if (!this.isModified("password") || this.isNew) {
        return next();
    }
    this.passwordChangedAt =Date.now() - 1000;
    next()
})


userSchema.methods.comparePassword = async function (candidatePassword, thePassword) {
    return await bcrypt.compare(candidatePassword, thePassword);
}

userSchema.methods.changedPasswordAfter = function (JWTtimeStamp){
    if (this.passwordChangedAt){
        const changedTimeStamp = parseInt((this.passwordChangedAt.getTime() /1000), 10)

        return changedTimeStamp > JWTtimeStamp;
    }
    return false;
}


userSchema.methods.createPasswordResetToken = function (){
    const token = crypto.randomBytes(32).toString("hex");
    this.PasswordResetToken = crypto.createHash("sha256").update(token).digest("hex");
    this.passwordResetExpires = Date.now() + 600 * 1000

    return token;
}


userSchema.methods.isSubscriptionActive = function (user){
    if (!user.isSubscribed) {
        return false;
    }
    return user.subscriptionEnd > new Date()
}


const User = mongoose.model("User",userSchema);

module.exports = User;