const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const ApiFeatures = require('./../utils/ApiFeatures');

exports.getAll = Model => catchAsync(async (req,res,next) => {
    let filter = {};
    if (req.params.productId) filter = {product: req.params.productId}

    const features = new ApiFeatures(Model.find(filter),req.query)
        .filter()
        .sort()
        .limitFields()

    const doc = await features.query;

    return res.status(200).json({
        status: "success",
        quantity: doc.length,
        data: doc
    });
})

exports.getOne = (Model, populateOptions) => catchAsync(async (req,res,next) => {
    let query = Model.findById(req.params.id)
    if (populateOptions){
        query = query.populate(populateOptions)
    }
    const doc = await query;
    if (!doc) {
        return next(new AppError("nothing found!", 404));
    }
    return res.status(200).json({
        status: "success",
        data: doc
    });
})

exports.updateOne = Model => catchAsync(async (req,res,next) => {
    const doc = await Model.findOneAndUpdate({_id:req.params.id}, req.body, {
        new: true,
        runValidators: true,
    });
    if (!doc){
        return next(new AppError("nothing found!", 404));
    }

    return res.status(200).json({
        status: "success",
        data: doc
    });
})

exports.deleteOne = Model => catchAsync(async (req,res,next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc){
        return next(new AppError("nothing found!", 404));
    }

    return res.status(204).json({
        status: "success",
        data: doc
    });
})

exports.createOne = Model => catchAsync(async (req,res,next) => {
    const doc = await Model.create(req.body);

    return res.status(200).json({
        status: "success",
        data: doc
    });
})