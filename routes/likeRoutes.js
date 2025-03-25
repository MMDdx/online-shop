const express = require("express");
const router = express.Router();
const authController = require("./../controllers/authController");
const likeController = require("./../controllers/likeController.js");

router.get("/:product", likeController.getAllLikesOnProduct)

router.use(authController.protect)
router.post("/", likeController.createLike);

router.route("/:product").delete(likeController.deleteLike);

module.exports = router;