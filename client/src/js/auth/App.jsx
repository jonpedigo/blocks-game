import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { useCookies } from 'react-cookie'
import Login from "./Login.jsx";

if (window.location.origin.indexOf('localhost') > 0) {
  window.socket = io.connect('http://localhost:4000');
} else {
  window.socket = io.connect();
}

function App() {
  const [cookies, setCookie, removeCookie] = useCookies(['user']);
  const [state, setState] = useState({ email: '', password: '', message: '', checkingCookie: !!cookies.user});

  useEffect(() => {
    if(cookies.user && !window.user) {
      window.socket.emit("authentication", {})
    }
  }, [])

  window.socket.on("authenticated", ({cookie, user}) => {
    // for some reason this gets called a couple times even when user is false..
    if (user && !window.user) {
      setCookie('user', cookie, { path: '/' });
      window.user = user;
      setState({...state, checkingCookie: false});
      PAGE.userIdentified()
    }

    window.clearUserCookie = () => {
      removeCookie("user");
      window.user = null
      setState({...state, checkingCookie: true});
    }

    window.getUserCookie = () => {
      return cookies.user
    }
  });

  window.socket.on("auth_message", ({ message }) => {
    setState({...state, message, checkingCookie: false})
  });

  const onLogIn = () => {
    window.socket.emit("authentication", {email: state.email, password: state.password});
  };

  const onSignUp = () => {
    window.socket.emit("authentication", { email: state.email, password: state.password, signup: true });
  };

  const onChange = e => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  if (window.user) {
    return null
  }

  if (!state.checkingCookie) {
    return (
      <Login actions={{
        onLogIn,
        onSignUp,
        onChange
      }} values={state} />
    )
  }

  return null
}

export default App;
