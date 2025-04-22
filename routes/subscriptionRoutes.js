const express = require('express');
const authController = require('./../controllers/authController');
const router = express.Router();
const userController = require('./../controllers/userController');

router.get("/:name", authController.protect, userController.activateSubscription)


module.exports = router;