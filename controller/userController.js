const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signToken = (id, name, ispremiumuser) => {
  return jwt.sign({ id, name, ispremiumuser }, process.env.JWT_SECRET, {
    expiresIn: "10h",
  });
};

exports.Signup = async (req, res) => {
  try {
    // console.log(req.body);
    const saltRounds = 10;
    bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: hash,
      });
      const token = signToken(user.id, user.name, user.ispremiumuser);
      if (!user) {
        res.status(500).json({
          msg: err,
        });
      }
      return res.status(201).json({
        msg: "user created successfully",
        token,
      });
    });
  } catch (err) {
    return res.status(500).json({ msg: "email already exist" });
  }
};

exports.Login = async (req, res) => {
  // console.log(req.body);
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    // console.log(user);
    if (!user) {
      return res.status(500).json({
        msg: "User not found",
      });
    }

    bcrypt.compare(
      req.body.password,
      user.password,
      async function (err, result) {
        if (err) {
          return res
            .status(404)
            .json({ status: "success", msg: "something went wrong!" });
        }
        if (result === true) {
          const token = signToken(user.id, user.name, user.ispremiumuser);
          return res.status(200).json({
            status: "success",
            msg: "user login successful",
            token,
          });
        } else {
          return res.status(500).json({
            status: "fail",
            msg: "User not authorized",
          });
        }
      }
    );
  } catch (err) {
    return res
      .status(500)
      .json({ status: "fail", msg: "error " + err.message });
  }
};
