const express = require("express");
const controller = require("../controller/userController");
const router = express.Router();

router.route("/signup").post(controller.Signup);
router.route("/login").post(controller.Login);

module.exports = router;
