const SibApiV3Sdk = require("sib-api-v3-sdk");

let defaultClient = SibApiV3Sdk.ApiClient.instance;

let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SIB_API_KEY;

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sender = {
  email: "vikashraj1490@gmail.com",
  name: "Vikash Rajpoot",
};

exports.ForgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const recievers = [
      {
        email: email,
      },
    ];

    const data = await apiInstance.sendTransacEmail({
      sender,
      to: recievers,
      subject: "email for forget password",
      textContent: `your new  opt is {{params.otp}}`,
      params: {
        otp: Math.floor(Math.random() * 100000 + 1),
      },
    });
    console.log(
      "API called successfully. Returned data: " + JSON.stringify(data)
    );
    return res.status(200).json({
      status: "success",
      data: "message has been sent",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      data: error,
    });
  }
};
