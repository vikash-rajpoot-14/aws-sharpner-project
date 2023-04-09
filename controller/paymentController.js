const Razorpay = require("razorpay");
const Order = require("./../models/order");

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
  try {
    const { order_id, payment_id, status } = req.body;
    Promise.all([
      Order.update(
        { paymentId: payment_id, status: status },
        { where: { orderid: order_id } }
      ),
      req.user.update({ ispremiumuser: true }),
    ])
      .then((values) => {
        // console.log("values", values);
        return res.status(202).json({
          status: status,
          message: `TRANSACTION ${status}`,
        });
      })
      .catch((err) => {
        return res.status(202).json({
          status: "fail",
          message: "transaction failed",
          error: err,
        });
      });
  } catch (error) {
    Order.update(
      { paymentId: payment_id, status: "FAIL" },
      { where: { orderid: order_id } }
    );
    return res.status(500).json({
      status: "error",
      error,
    });
  }
};
