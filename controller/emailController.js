const SibApiV3Sdk = require("sib-api-v3-sdk");
const Frequest = require("./../models/forgetpasswordrequest");
const User = require("./../models/user");
const bcrypt = require("bcrypt");
const sequelize = require("./../util/database");

let defaultClient = SibApiV3Sdk.ApiClient.instance;

let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SIB_API_KEY;

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sender = {
  email: "vikashraj1490@gmail.com",
  name: "Vikash Rajpoot",
};

exports.ForgetPassword = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    var { email } = req.body;
    const user = await User.findOne({
      where: { email: email },
      transaction: t,
    });
    const frequeset = await user.createFrequest(
      {
        isActive: true,
      },
      { transaction: t }
    );
    // console.log("object");
    const uuid = frequeset.id;
    const recievers = [
      {
        email: email,
      },
    ];

    const data = await apiInstance.sendTransacEmail({
      sender,
      to: recievers,
      subject: "email for forget password",
      htmlContent: `<p>this link is valid for single use only !<p><a href={{params.link}}{{params.uuid}} >{{params.link}}{{params.uuid}} !</a>`,
      params: {
        link: "http://localhost:3000/user/forgotpassword/",
        uuid: uuid,
      },
    });
    console.log(
      "API called successfully. Returned data: " + JSON.stringify(data)
    );
    await t.commit();
    return res.status(200).json({
      status: "success",
      data: "message has been sent",
    });
  } catch (error) {
    console.log(error);
    await this.rollback();
    return res.status(500).json({
      status: "fail",
      data: error,
    });
  }
};

exports.ResetPassword = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const uuid = req.params.id;
    const request = await Frequest.findOne({
      where: { id: uuid },
      transaction: t,
    });
    if (request.isActive) {
      await Frequest.update(
        {
          isActive: false,
        },
        {
          where: { id: uuid },
          transaction: t,
        }
      );
      await t.commit();
      return res.redirect(
        "http://127.0.0.1:5500/frontend/Forgotpassword/passwordform.html?" +
          request.userId
      );
    } else {
      throw new Error("cannot use same link twice");
    }
  } catch (error) {
    await this.rollback();
    return res.status(500).json({
      status: "error",
      data: error.message,
    });
  }
};

exports.setforgotpassword = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { password } = req.body;
    const id = req.params.id;
    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);
    const user = await User.update(
      {
        password: hashed,
      },
      {
        where: { id: id },
        transaction: t,
      }
    );
    if (user) {
      await t.commit();
      return res.redirect("http://127.0.0.1:5500/frontend/Login/login.html");
    }
    await t.commit();
    return res.status(404).json({
      status: "user not found",
      data: err.message,
    });
  } catch (err) {
    await this.rollback();
    return res.status(500).json({
      status: "fail",
      data: err.message,
    });
  }
};
