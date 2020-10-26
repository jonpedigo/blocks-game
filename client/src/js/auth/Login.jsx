import React from "react";

// <button onClick={actions.onSignUp} color="violet" size="large">
//   Sign Up
// </button>
const Login = ({ values, actions }) => (
  <div>
    <input
      name="email"
      placeholder="Email"
      value={values.email}
      onChange={actions.onChange}
    />
    <input
      name="password"
      placeholder="Password"
      type="password"
      value={values.password}
      onChange={actions.onChange}
    />
    <button onClick={actions.onLogIn} color="blue" size="large">
      Log In
    </button>

    <div>{values.message}</div>
  </div>
);

export default Login;
