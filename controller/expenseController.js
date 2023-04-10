const Expense = require("./../models/expense");
const User = require("./../models/user");
const Sequelize = require("sequelize");

exports.PostExpense = (req, res) => {
  if (
    req.body.expense.length < 1 ||
    req.body.expense === undefined ||
    req.body.description.length < 1 ||
    req.body.description === undefined ||
    req.body.category.length < 1 ||
    req.body.category === undefined
  ) {
    return res.status(204).json({
      status: "fail",
      msg: "Enter all fields",
    });
  }
  Expense.create({
    expense: req.body.expense,
    description: req.body.description,
    category: req.body.category,
    userId: req.user.id,
  })
    .then((expense) => {
      // console.log("object");
      let totalExpense =
        Number(req.user.totalExpense) + Number(expense.expense);
      // console.log(totalExpense);
      User.update(
        {
          totalExpense: totalExpense,
        },
        {
          where: { id: req.user.id },
        }
      );
      res.json({
        status: "success",
        data: expense,
      });
    })
    .catch((err) => {
      res.json({
        status: "success",
        data: err.message,
      });
    });
};

exports.getExpenses = async (req, res) => {
  const expenses = await Expense.findAll({ where: { Userid: req.user.id } });
  // await User.update(
  //   {
  //     totalExpense: [
  //       Sequelize.fn("sum", Sequelize.col("expenses.expense")),
  //       "totalExpense",
  //     ],
  //   },
  //   {
  //     where: { id: req.user.id },
  //   }
  // );
  // await User.update(
  //   {
  //     totalExpense: Sequelize.literal(
  //       `(SELECT SUM(expense) FROM expenses WHERE userId = ${req.user.id})`
  //     ),
  //   },
  //   {
  //     where: { id: req.user.id },
  //   }
  // );
  return res.status(200).json({
    status: "success",
    data: expenses,
  });
};

exports.deleteExpenses = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id },
    });
    // console.log("object");
    // console.log(expense.expense);
    let totalExpense = Number(req.user.totalExpense) - Number(expense.expense);
    // console.log(totalExpense);
    User.update(
      {
        totalExpense: totalExpense,
      },
      {
        where: { id: req.user.id },
      }
    );
    await expense.destroy();
    return res.status(202).json({
      status: "success",
      data: "deleted",
    });
  } catch (error) {
    return res.status(500).json({
      status: "success",
      msg: error.message,
    });
  }
};

exports.allExpenses = async (req, res) => {
  try {
    // const expenses = await User.findAll({
    //   attributes: [
    //     "id",
    //     "name",
    //     [Sequelize.fn("sum", Sequelize.col("expenses.expense")), "total_Cost"],
    //   ],
    //   include: [
    //     {
    //       model: Expense,
    //       attributes: [],
    //     },
    //   ],
    //   group: ["user.id"],
    //   order: [["total_Cost", "DESC"]],
    // });
    // const expenses = await Expense.findAll({
    //   attributes: [
    //     "userId",
    //     [Sequelize.fn("sum", Sequelize.col("expense")), "total_Cost"],
    //   ],
    //   // include: [{ model: User, attributes: ["name"] }],
    //   group: "userId",
    //   order: [["total_Cost", "DESC"]],
    // });
    // console.log("result", expenses);
    const expenses = await User.findAll({
      attributes: ["id", "name", "totalExpense"],
      order: [["totalExpense", "DESC"]],
    });
    return res.status(200).json({
      status: "success",
      data: expenses,
    });
  } catch (error) {
    return res.status(200).json({
      status: "fail",
      data: error,
    });
  }
};
