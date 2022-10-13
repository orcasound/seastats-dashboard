import { useState } from "react";

function useAppPassword() {
  const [password, setPassword] = useState();

  function PasswordForm() {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          // get the value of the password input
          const pwd = data.get("password") || "";
          // store the password in session storage
          sessionStorage.setItem("appPwd", pwd);
          // update the password state
          setPassword(pwd);
        }}
      >
        <label htmlFor="password">Password</label>{" "}
        <input
          type="password"
          name="password"
          id="password"
          defaultValue={sessionStorage.getItem("appPwd") || ""}
        />{" "}
        <button type="submit">Submit</button>
      </form>
    );
  }

  return {
    password,
    PasswordForm,
  };
}

export default useAppPassword;
