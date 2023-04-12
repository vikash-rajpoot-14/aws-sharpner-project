const ul = document.getElementById("list");
const error = document.getElementById("error");
const leaderboard = document.getElementById("leaderboard");
const listboard = document.getElementById("listboard");
const leaderbtn = document.getElementById("leader-btn");
const download = document.getElementById("download");
leaderboard.style.display = "none";
listboard.style.display = "none";
leaderbtn.style.display = "none";
download.style.display = "none";
let token = localStorage.getItem("token");
let decode = parseJwt(token);
showdata();

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

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
    error.innerHTML = "Enter all fields";
    setTimeout(() => {
      error.innerHTML = "";
    }, 1000);
  }
  (e.target.expense.value = ""),
    (e.target.description.value = ""),
    (e.target.category.value = ""),
    showdata();
}

async function showdata() {
  let token = localStorage.getItem("token");
  const decode = parseJwt(token);

  const expenses = await axios.get("http://localhost:3000/expenses", {
    headers: {
      "Content-type": "application/json",
      authorization: "Bearer " + `${token}`,
    },
  });

  if (decode.ispremiumuser) {
    buttonChange();
  }
  let listData = "";
  if (expenses.data.data.length < 1) {
    ul.innerHTML = listData;
  } else {
    expenses.data.data.map((expense) => {
      listData += '<li class="list">';
      listData += ` ${expense.expense} ${expense.description} ${expense.category}   `;
      listData +=
        "<button class='btn-delete' onclick='deleteData(`" +
        expense.id +
        "`)'>delete</button> ";
      listData += "</li>";
    });
    ul.innerHTML = listData;
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
      const updatedData = await axios.post(
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
      // console.log("updatedData", updatedData);
      localStorage.setItem("token", JSON.stringify(updatedData.data.token));
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
    alert(response.error.reason);
  });
  e.preventDefault();
};
leaderbtn.onclick = function leader() {
  leaderboard.style.display = "block";
  listboard.style.display = "block";
  download.style.display = "block";
  leaderboardTableData();
};

async function buttonChange() {
  const premiumButton = document.getElementById("rzp-button1");
  premiumButton.innerHTML = "you are a premium user now";
  premiumButton.setAttribute("disabled", "");
  leaderbtn.style.display = "block";
  leaderboardTableData();
}

async function leaderboardData() {
  const response = await axios.get(
    "http://localhost:3000/expenses/allExpenses",
    {
      headers: {
        "Content-type": "application/json",
        authorization: "Bearer " + `${token}`,
      },
    }
  );
  console.log(response);
  // console.log(response.data.data);
  let arr = response.data.data;
  // for (let i = 0; i < arr.length; i++) {
  //   arr[i].expenses = arr[i].expenses.reduce((a, b) => a + b.expense * 1, 0);
  // }
  // arr.sort((a, b) => b.expenses - a.expenses);
  let listData = "";
  if (arr.length < 1) {
    listboard.innerHTML = listData;
  } else {
    arr.map((expense) => {
      listData += '<li class="list-item">';
      listData += `Name :-${expense.name}   Totalexpenses :-${
        expense.totalExpense * 1
      }  `;
      listData += "</li>";
      listboard.innerHTML = listData;
    });
  }
}

async function leaderboardTableData() {
  const response = await axios.get("http://localhost:3000/expenses", {
    headers: {
      "Content-type": "application/json",
      authorization: "Bearer " + `${token}`,
    },
  });
  // console.log(response.data.data);
  let expenses = response.data.data;
  let arr = [...expenses];
  // for (let i = 0; i < arr.length; i++) {
  //   arr[i].expenses = arr[i].expenses.reduce((a, b) => a + b.expense * 1, 0);
  // }
  // arr.sort((a, b) => b.expenses - a.expenses);
  const d = Date.now();
  const now = new Date(d);
  const monthName = now.toLocaleString("default", { month: "long" }); // Get the month name using toLocaleString()
  const year = now.getFullYear();
  const monthnumber = now.getMonth();
  let cmonth = String(monthnumber + 1);
  cmonth = "0" + cmonth;
  // const month = arr[0].createdAt.slice(0, 10).split("-")[1];
  arr = arr.filter(
    (expense) => expense.createdAt.slice(0, 10).split("-")[1] === cmonth
  );
  let totalIncome = 0;
  let totalExpense = 0;
  let totalSaving = 0;
  let listData = "";
  listData += `<h2>${monthName} ${year}</h2>`;
  listData += "<table>";
  listData +=
    "<tr><th>Date</th><th>Description</th><th>Category</th><th>Income</th><th>Expenses</th></tr>";
  if (arr.length < 1) {
    listData += "</table>";
    listboard.innerHTML = listData;
  } else {
    arr.map((expense) => {
      listData += '<tr class="table-item">';
      if (expense.category === "salary") {
        totalIncome += expense.expense * 1;
        listData += `<th>${expense.createdAt.slice(0, 10)}</th><th>${
          expense.description
        }</th><th>${expense.category}</th><th>${
          expense.expense
        }.00</th><th>00.00</th> `;
      } else {
        totalExpense += expense.expense * 1;
        listData += `<th>${expense.createdAt.slice(0, 10)}</th><th>${
          expense.description
        }</th><th>${expense.category}</th><th>00.00</th><th>${
          expense.expense
        }.00</th> `;
      }
      listData += "</tr>";
    });
    totalSaving = totalIncome - totalExpense;
    listData += `<tr><th></th><th></th><th></th><th>${totalIncome}.00</th><th>${totalExpense}.00</th></tr>`;
    listData += `<tr><th></th><th></th><th></th><th style= "color : green ; width:80px">$ ${totalIncome}.00</th><th style= "color : red ; width:60px">$ ${totalExpense}</th></tr>`;
    listData += `<table style = "width: 80%;"><tr><th style= "color : blue; text-align: right; ">Total Saving :- $ ${totalSaving}.00</th></tr></table>`;
    listData += "</table>";
    // mothly table
    listData += "<h3>Yearly Report</h3>";
    listData += "<table>";
    listData +=
      "<tr><th>Month</th><th>Income</th><th>Expense</th><th>Saving</th></tr>";
    listData += `<tr><th>${monthName}</th><th> ${totalIncome}.00</th><th>${totalExpense}.00</th><th> ${totalSaving}.00</th></tr>`;
    listData += `<tr><th></th><th style= "color : green">$ ${totalIncome}.00</th><th style= "color : red">$ ${totalExpense}.00</th><th style= "color : blue">$ ${totalSaving}.00</th></tr>`;
    listData += "</table>";
    // notes table
    listData += `<h3>Notes Report ${year}</h3>`;
    listData += "<table>";
    listData += "<tr><th>Date</th><th>Notes</th></tr>";
    listData += "<tr><th>02-04-2023</th><th>have to go to doctor</th></tr>";
    listData += "<tr><th>06-04-2023</th><th>meet at sharpner </th></tr>";
    listData += "</table>";
    listboard.innerHTML = listData;
  }
}
