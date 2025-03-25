const reviewController = require("./../controllers/reviewController");
const express = require("express");
const authController = require("./../controllers/authController");

const router = express.Router({mergeParams: true});

router.route("/").get(reviewController.getAllReviews)

router.use(authController.protect)
router.post("/", reviewController.createReviewOnUser)

router.route("/:id")
    .delete(reviewController.deleteReview)
    .get(reviewController.getReview)
    .patch(reviewController.updateReview)


module.exports = router;