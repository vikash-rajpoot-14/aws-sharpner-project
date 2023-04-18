const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
//.env
dotenv.config({ path: `${__dirname}/config.env` });

//database
const sequelize = require("./util/database");

//routes
const UserRoutes = require("./routes/user");
const ExpenseRoutes = require("./routes/expense");
const PaymentRoutes = require("./routes/razorpay");

const app = express();
//models
const User = require("./models/user");
const Expense = require("./models/expense");
const Order = require("./models/order");
const Fprequest = require("./models/forgetpasswordrequest");
const Downloadfile = require("./models/downloadfile");
//association
Expense.belongsTo(User);
User.hasMany(Expense);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Fprequest);
Fprequest.belongsTo(User);

User.hasMany(Downloadfile);
Downloadfile.belongsTo(User);
//middleware

// app.use(helmet());
// var accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
//   flags: "a",
// });

// setup the logger
// app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.json());

// app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/user", UserRoutes);
app.use("/expenses", ExpenseRoutes);
app.use("/payment", PaymentRoutes);
// app.get("/", (req, res) => {
//   res.send("Welcome");
// });
const port = 3000;
sequelize
  // .sync({ force: true })
  .sync()
  .then((result) => {
    app.listen(port);
  })
  .catch((err) => {
    console.log(err);
  });
