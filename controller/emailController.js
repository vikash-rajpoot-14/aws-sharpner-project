const Sib = require("sib-api-v3-sdk");
let client = Sib.ApiClient.instance;

let apiKey = client.authentications["api-key"];
apiKey.apiKey =
  "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";

let transEmailApi = new Sib.TransactionalEmailsApi();

const sender = {
  email: "vikashraj1490@gmail.com",
  name: "Vikash Rajpoot",
};

const recievers = [
  {
    email: "vikas14902255@gmail.com",
  },
];

transEmailApi
  .sendTransacEmail({
    sender,
    to: recievers,
    subject: "email for forget password",
    textContent: `your opt is {{params.otp}}`,
    params: {
      otp: Math.floor(Math.random() * 1000000 + 1),
    },
  })
  .then((data) => {
    console.log(
      "API called successfully. Returned data: " + JSON.stringify(data)
    );
  })
  .catch((err) => {
    console.error(err);
  });
