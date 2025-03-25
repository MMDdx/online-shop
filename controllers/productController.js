const Product = require("./../models/productModel")
const Factory = require("./FactoryController.js")

exports.getAllProducts = Factory.getAll(Product)

exports.createProduct = Factory.createOne(Product)
exports.getProduct = Factory.getOne(Product, {path: "reviews"})

exports.deleteProduct = Factory.deleteOne(Product)
