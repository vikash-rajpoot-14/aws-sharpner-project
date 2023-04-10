const express = require("express");
const controller = require("../controller/expenseController");
const authController = require("./../controller/authController");
const router = express.Router();

router
  .route("/add-expense")
  .post(authController.authenticate, controller.PostExpense);
router.route("/").get(authController.authenticate, controller.getExpenses);
router
  .route("/delete-expenses/:id")
  .delete(authController.authenticate, controller.deleteExpenses);
router
  .route("/allExpenses")
  .get(authController.authenticate, controller.allExpenses);

module.exports = router;
