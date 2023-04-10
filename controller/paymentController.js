const Razorpay = require("razorpay");
const Order = require("./../models/order");
const jwt = require("jsonwebtoken");

const signToken = (id, name, ispremiumuser) => {
  return jwt.sign({ id, name, ispremiumuser }, process.env.JWT_SECRET, {
    expiresIn: "10h",
  });
};

exports.purchasepremiumship = async (req, res) => {
  try {
    var rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEYID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    rzp.orders.create({ amount: 5000, currency: "INR" }, (err, order) => {
      if (err) {
        throw new Error(JSON.stringify(err));
      }
      //  const token = signToken(user.id, user.name, user.ispremiumuser);
      req.user
        .createOrder({ orderid: order.id, status: "PENDING" })
        .then((order) => {
          return res
            .status(201)
            .json({ user: req.user, order, key_id: rzp.key_id });
        })
        .catch((err) => {
          throw new Error(JSON.stringify(err));
        });
    });
  } catch (error) {
    return res.status(500).json({ msg: "something went wrong", error });
  }
};

exports.updatetransactionstatus = async (req, res) => {
  const { order_id, payment_id, status } = req.body;
  try {
    const values = await Promise.all([
      Order.update(
        { paymentId: payment_id, status: status },
        { where: { orderid: order_id } }
      ),
      req.user.update({ ispremiumuser: true }),
    ]);
    // console.log(values[1].id, values[1].name, values[1].ispremiumuser);
    const token = signToken(
      values[1].id,
      values[1].name,
      values[1].ispremiumuser
    );
    // console.log(token);
    return res.status(202).json({
      status: status,
      message: `TRANSACTION ${status}`,
      token,
    });
  } catch (error) {
    Order.update(
      { paymentId: payment_id, status: "FAIL" },
      { where: { orderid: order_id } }
    );
    return res.status(500).json({
      status: "fail",
      message: `TRANSACTION ${status}`,
      error,
    });
  }
};
