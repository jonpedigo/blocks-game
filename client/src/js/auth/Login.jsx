import React from "react";

const Login = ({ values, actions }) => (
  <div>
    <input
      name="username"
      placeholder="Username"
      value={values.username}
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
    <button onClick={actions.onSignUp} color="violet" size="large">
      Sign Up
    </button>
    <div>{values.message}</div>
  </div>
);

export default Login;
