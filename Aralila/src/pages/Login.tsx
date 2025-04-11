import React from "react";
import { Formik, useFormik } from "formik";
import { Link } from "react-router-dom";
import Input from "../components/Input";
import "../styles/Login.css";

const Login = () => {
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  console.log("Form values: ", formik.values);
  return (
    <>
      <div className="custom-login-container">
        <div className="child-container">
          <img src="/full-logo.png" alt="Logo" width="85%" height="auto" />
          <span className="span-heading">Pagsulat, Pag-unlad, Pagwawagi!</span>
          <form onSubmit={formik.handleSubmit} className="login-form">
            <Input
              htmlFor="email"
              inputLabel="Email"
              placeholder="Enter email address"
              id="email"
              name="email"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.email}
            />
            <Input
              htmlFor="password"
              inputLabel="Password"
              placeholder="Enter your password"
              id="password"
              name="password"
              type="password"
              onChange={formik.handleChange}
              value={formik.values.password}
            />
            <span className="span-ft-password">Forgot Password?</span>
            <button type="submit" className="custom-button">
              Sign in
            </button>
          </form>
          <div>
            <span>Don't have an account? </span>
            <Link to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
