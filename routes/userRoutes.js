const express = require('express');
const authController = require('./../controllers/authController');
const router = express.Router();
const userController = require('./../controllers/userController');
// change this later
router.get("/", userController.getAll)

router.post("/signup",authController.signup );
router.post("/login",authController.login);
router.get("/logout", authController.logOut)
router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword/:token" , authController.resetPassword);

router.use(authController.protect)

router.get("/me",  userController.me);
router.delete("/deleteMe", userController.deleteMe);
router.patch("/updateMe", userController.updateMe);
router.patch("/updatePassword", authController.updatePassword)
module.exports = router;