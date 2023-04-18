const Expense = require("./../models/expense");
const User = require("./../models/user");
const sequelize = require("./../util/database");
const AWS = require("aws-sdk");
// const Downloadfile = require("./../models/downloadfile");

function UploadToS3(data, file) {
  try {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const AWS_KEY_ID = process.env.AWS_KEY_ID;
    const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;

    let s3bucket = new AWS.S3({
      accessKeyId: AWS_KEY_ID,
      secretAccessKey: AWS_SECRET_KEY,
    });

    var params = {
      Bucket: BUCKET_NAME,
      Key: file,
      Body: data,
      ACL: "public-read",
    };
    // console.log("params", params);
    return new Promise((resolve, reject) => {
      s3bucket.upload(params, (err, data) => {
        if (err) {
          console.log("Something went wrong", err);
          reject(err);
        } else {
          // console.log("success", data);
          resolve(data.Location);
        }
      });
    });
  } catch (err) {
    res.status(500).json({
      error: err,
      fileUrl: "",
    });
  }
}

exports.FileDownload = async (req, res) => {
  try {
    const expense = await req.user.getExpenses();
    // console.log(expense);
    const StringifyExpense = JSON.stringify(expense);
    const userId = req.user.id;
    const filename = `Expense-${userId}-${new Date()}.txt`;
    const fileUrl = await UploadToS3(StringifyExpense, filename);
    await req.user.createDownloadfile({
      fileUrl: fileUrl,
    });
    console.log("object", fileUrl);
    res.status(201).json({
      success: true,
      fileUrl: fileUrl,
    });
    // console.log(req.user);
    //   const data = await Expense.findAll({ where: { userId: req.user.id } });
    //   const csvWriter = createObjectCsvWriter({
    //     path: `${__dirname}/../data.csv`,
    //     header: [
    //       { id: "id", title: "ID" },
    //       { id: "expense", title: "Expense" },
    //       { id: "description", title: "Description" },
    //       { id: "category", title: "Category" },
    //     ],
    //   });
    //   await csvWriter.writeRecords(data);
    //   const file = `${__dirname}/../data.csv`;
    //   res.download(file);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

exports.PostExpense = async (req, res) => {
  const t = await sequelize.transaction();
  try {
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
    const expense = await Expense.create(
      {
        expense: req.body.expense,
        description: req.body.description,
        category: req.body.category,
        userId: req.user.id,
      },
      { transaction: t }
    );
    // console.log("object");
    let totalExpense = Number(req.user.totalExpense) + Number(expense.expense);
    // console.log(totalExpense);
    await User.update(
      {
        totalExpense: totalExpense,
      },
      {
        where: { id: req.user.id },
        transaction: t,
      }
    );
    await t.commit();
    return res.status(201).json({
      status: "success",
      data: expense,
    });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({
      status: "success",
      data: err.message,
    });
  }
};

exports.getExpenses = async (req, res) => {
  try {
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
  } catch (err) {
    return res.status(500).json({
      status: "error",
      data: err.message,
    });
  }
};

exports.deleteExpenses = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id },
      transaction: t,
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
        transaction: t,
      }
    );
    await expense.destroy();
    await t.commit();
    return res.status(202).json({
      status: "success",
      data: "deleted",
    });
  } catch (error) {
    await t.rollback();
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
    return res.status(500).json({
      status: "fail",
      data: error.message,
    });
  }
};

exports.DownloadTable = async (req, res) => {
  try {
    const response = await req.user.getDownloadfiles();
    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      error: error,
    });
  }
};

exports.getPageExpenses = (req, res) => {
  // console.log(req.query);
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 1;
  const ITEM_PER_PAGE = limit;
  let totalCounts;
  // const totalItem = await req.user.countExpenses();
  Expense.count({ where: { UserId: req.user.id } })
    .then((total) => {
      totalCounts = total;
      return Expense.findAll({
        where: { UserId: req.user.id },
        offset: (page - 1) * ITEM_PER_PAGE,
        limit: ITEM_PER_PAGE,
      });
    })
    .then((expense) => {
      return res.status(200).json({
        CURRENT_PAGE: page,
        HAS_NEXT_PAGE: ITEM_PER_PAGE * page < totalCounts,
        NEXT_PAGE: page + 1,
        HAS_PREVIOUS_PAGE: page > 1,
        PREVIOU_PAGE: page - 1,
        LAST_PAGE: Math.ceil(totalCounts / ITEM_PER_PAGE),
        data: expense,
      });
    })
    .catch((err) => {
      return res.status(200).json({
        status: "fail",
        error: err,
      });
    });
};
