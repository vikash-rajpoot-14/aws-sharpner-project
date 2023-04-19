async function showForgot(e) {
  try {
    e.preventDefault();
    const obj = {
      email: e.target.email.value,
    };
    const user = await axios.post(
      "http://localhost:3000/user/forgotpassword",
      obj
    );
    console.log(user);
    e.target.email.value = "";
    if (user.status == 200) {
      document.getElementById("error").innerHTML =
        "check your mail for reset password link";
      // setTimeout(() => {
      //   document.getElementById("error").innerHTML = "";
      //   e.target.email.value = "";
      // }, 2000);
    }
  } catch (error) {
    document.getElementById("error").innerHTML = "enter valid email address";
    setTimeout(() => {
      document.getElementById("error").innerHTML = "";
      e.target.email.value = "";
    }, 1000);
  }
}

async function showPassword(e) {
  e.preventDefault();
  try {
    const id = e.target.baseURI.split("?")[1];
    password = e.target.password.value;
    cpassword = e.target.cpassword.value;
    console.log(id);
    if (cpassword === password) {
      const obj = {
        password: password,
      };
      const user = await axios.post(
        `http://localhost:3000/user/setforgotpassword/${id}`,
        obj
      );
      e.target.password.value = "**************";
      e.target.cpassword.value = "*************";
      document.getElementById("error").innerHTML =
        "Your password has been updated successfully !";
      setTimeout(() => {
        window.location.href = "http://127.0.0.1:3000/Login/login.html";
      }, 1000);
    } else {
      document.getElementById("error").innerHTML =
        "Password and confirm password should be same !";
      setTimeout(() => {
        document.getElementById("error").innerHTML = "";
        e.target.password.value = "";
        e.target.cpassword.value = "";
      }, 2000);
    }
  } catch (error) {
    document.getElementById("error").innerHTML = "enter valid email address";
    setTimeout(() => {
      document.getElementById("error").innerHTML = "";
      e.target.email.value = "";
    }, 1000);
  }
}
