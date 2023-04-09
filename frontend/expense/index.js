const ul = document.getElementById("list");
const token = localStorage.getItem("token");
const error = document.getElementById("error");
const leaderboard = document.getElementById("leaderboard");
const listboard = document.getElementById("listboard");
const leaderbtn = document.getElementById("leader-btn");
leaderboard.style.display = "none";
listboard.style.display = "none";
leaderbtn.style.display = "none";

showdata();

async function showHandler(e) {
  e.preventDefault();
  const obj = {
    expense: e.target.expense.value,
    description: e.target.description.value,
    category: e.target.category.value,
  };
  const expense = await axios.post(
    "http://localhost:3000/expenses/add-expense",
    obj,
    {
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + `${token}`,
      },
    }
  );
  if (expense.status === 204) {
    return (error.innerHTML = "Enter all fields");
  }
  (e.target.expense.value = ""),
    (e.target.description.value = ""),
    (e.target.category.value = ""),
    showdata();
}

async function showdata() {
  const expenses = await axios.get("http://localhost:3000/expenses", {
    headers: {
      "Content-type": "application/json",
      authorization: "Bearer " + `${token}`,
    },
  });
  localStorage.setItem("ispremium", expenses.data.ispremium);
  if (JSON.parse(localStorage.getItem("ispremium"))) {
    buttonChange();
  }
  let listData = "";
  if (expenses.data.data.length < 1) {
    ul.innerHTML = listData;
  } else {
    expenses.data.data.map((expense) => {
      listData += '<li class="list-item">';
      listData += `${expense.expense} ${expense.description} ${expense.category}  `;
      listData +=
        "<button class='btn-delete' onclick='deleteData(`" +
        expense.id +
        "`)'>delete</button>";
      listData += "</li>";
      ul.innerHTML = listData;
    });
  }
}

async function deleteData(id) {
  await axios.delete(`http://localhost:3000/expenses/delete-expenses/${id}`, {
    headers: {
      "Content-type": "application/json",
      authorization: "Bearer " + `${token}`,
    },
  });
  showdata();
}

document.getElementById("rzp-button1").onclick = async function (e) {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    "http://localhost:3000/payment/purchasepremiumship",
    {
      headers: {
        "Content-type": "application/json",
        authorization: "Bearer " + `${token}`,
      },
    }
  );
  // console.log(response);
  var options = {
    key: response.data.key_id, // Enter the Key ID generated from the Dashboard
    order_id: response.data.order.orderid, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    // callback_url: "https://eneqd3r9zrjok.x.pipedream.net/",
    // prefill: {
    //   name: response.data.user.name, //your customer's name
    //   email: response.data.user.email,
    //   contact: response.data.user.phone,
    // },
    // notes: {
    //   address: "Razorpay Corporate Office",
    // },
    theme: {
      color: "#3399cc",
    },
    handler: async function (response) {
      const data = await axios.post(
        "http://localhost:3000/payment/updatetransactionstatus",
        {
          status: "SUCCESS",
          order_id: options.order_id,
          payment_id: response.razorpay_payment_id,
        },
        {
          headers: {
            "Content-type": "application/json",
            authorization: "Bearer " + `${token}`,
          },
        }
      );
      // console.log("data", data);
      alert("you are a premium user now");
      buttonChange();
    },
  };
  var rzp1 = new Razorpay(options);
  rzp1.open();
  rzp1.on("payment.failed", async function (response) {
    await axios.post(
      "http://localhost:3000/payment/updatetransactionstatus",
      {
        status: "FAILED",
        order_id: response.error.metadata.order_id,
        payment_id: response.error.metadata.payment_id,
      },
      {
        headers: {
          "Content-type": "application/json",
          authorization: "Bearer " + `${token}`,
        },
      }
    );
    // console.log("res", response);
    alert(response.error.reason);
  });
  e.preventDefault();
};
leaderbtn.onclick = function leader() {
  leaderboard.style.display = "block";
  listboard.style.display = "block";
  leaderboardData();
};

async function buttonChange() {
  const premiumButton = document.getElementById("rzp-button1");
  premiumButton.innerHTML = "you are a premium user now";
  premiumButton.setAttribute("disabled", "");
  leaderbtn.style.display = "block";
}

async function leaderboardData() {
  const { data } = await axios.get(
    "http://localhost:3000/expenses/allExpenses",
    {
      headers: {
        "Content-type": "application/json",
        authorization: "Bearer " + `${token}`,
      },
    }
  );
  let arr = data.data;
  for (let i = 0; i < arr.length; i++) {
    arr[i].expenses = arr[i].expenses.reduce((a, b) => a + b.expense * 1, 0);
  }
  arr.sort((a, b) => b.expenses - a.expenses);
  let listData = "";
  if (arr.length < 1) {
    listboard.innerHTML = listData;
  } else {
    arr.map((expense) => {
      listData += '<li class="list-item">';
      listData += `Name :-${expense.name}   Totalexpenses :-${expense.expenses}  `;
      listData += "</li>";
      listboard.innerHTML = listData;
    });
  }
}
