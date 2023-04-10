const express = require("express");
const controller = require("../controller/userController");
const router = express.Router();

router.route("/signup").post(controller.Signup);
router.route("/login").post(controller.Login);
router.route("/forgotpassword").post(controller.ForgetPassword);
module.exports = router;
