const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sequelize = require("../util/database");
const { createObjectCsvWriter } = require("csv-writer");
const fs = require("fs");
const Expense = require("../models/expense");

const signToken = (id, name, ispremiumuser) => {
  return jwt.sign({ id, name, ispremiumuser }, process.env.JWT_SECRET, {
    expiresIn: "10h",
  });
};

exports.Signup = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // console.log(req.body);
    const saltRounds = 10;
    const hashed = await bcrypt.hash(req.body.password, saltRounds);
    const user = await User.create(
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: hashed,
      },
      {
        transaction: t,
      }
    );
    // console.log("usre");
    // console.log(user);
    const token = signToken(user.id, user.name, user.ispremiumuser);
    if (!user) {
      res.status(500).json({
        msg: err,
      });
    }
    await t.commit();
    return res.status(201).json({
      msg: "user created successfully",
      token,
    });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ msg: "email already exist" });
  }
};

exports.Login = async (req, res) => {
  const t = await sequelize.transaction();
  // console.log(req.body);
  try {
    const user = await User.findOne({
      where: { email: req.body.email },
      transaction: t,
    });
    // console.log(user);
    if (!user) {
      return res.status(500).json({
        msg: "User not found",
      });
    }
    const result = await bcrypt.compare(req.body.password, user.password);
    if (result === true) {
      const token = signToken(user.id, user.name, user.ispremiumuser);
      await t.commit();
      return res.status(200).json({
        status: "success",
        msg: "user login successful",
        token,
      });
    } else {
      await t.rollback();
      return res.status(500).json({
        status: "fail",
        msg: "User not authorized",
      });
    }
  } catch (err) {
    await t.rollback();
    return res
      .status(500)
      .json({ status: "fail", msg: "error " + err.message });
  }
};
