const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

//.env
dotenv.config({ path: `${__dirname}/config.env` });

//database
const sequelize = require("./util/database");

//routes
const UserRoutes = require("./routes/user");
const ExpenseRoutes = require("./routes/expense");
const PaymentRoutes = require("./routes/razorpay");
//models
const User = require("./models/user");
const Expense = require("./models/expense");
const Order = require("./models/order");
//association
Expense.belongsTo(User);
User.hasMany(Expense);

User.hasMany(Order);
Order.belongsTo(User);
//middleware
const app = express();
app.use(bodyParser.json());

// app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/user", UserRoutes);
app.use("/expenses", ExpenseRoutes);
app.use("/payment", PaymentRoutes);
app.get("/", (req, res) => {
  res.send("Welcome");
});

sequelize
  // .sync({ force: true })
  .sync()
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
