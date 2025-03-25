const ProductController = require("./../controllers/productController")
const express = require("express");
const reviewRouter = require("./reviewRoutes")
const router = express.Router();


router.route("/")
    .get(ProductController.getAllProducts)
    .post(ProductController.createProduct)

router.route("/:id")
    .get(ProductController.getProduct)
    .delete(ProductController.deleteProduct)

router.use("/:productId/reviews", reviewRouter);


module.exports = router;