const express = require("express");
const controller = require("../controller/userController");
const emailcontroller = require("../controller/emailController");

const router = express.Router();

router.route("/signup").post(controller.Signup);
router.route("/login").post(controller.Login);
router.route("/forgotpassword").post(emailcontroller.ForgetPassword);
module.exports = router;
