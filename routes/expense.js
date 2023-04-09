const express = require("express");
const controlller = require("../controller/expenseController");
const authController = require("./../controller/authController");
const router = express.Router();

router
  .route("/add-expense")
  .post(authController.authenticate, controlller.PostExpense);
router.route("/").get(authController.authenticate, controlller.getExpenses);
router
  .route("/delete-expenses/:id")
  .delete(authController.authenticate, controlller.deleteExpenses);
router
  .route("/allExpenses")
  .get(authController.authenticate, controlller.allExpenses);

module.exports = router;
