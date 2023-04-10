async function showForgot(e) {
  e.preventDefault();
  const obj = {
    email: e.target.email.value,
  };
  const user = await axios.post(
    "http://localhost:3000/user/forgotpassword",
    obj
  );
  e.target.email.value = "";
  console.log(user);
}
