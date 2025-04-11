import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import "../styles/Signup.css";
import { Formik, useFormik } from "formik";
import Button from "../components/Button";
import Input from "../components/Input";
import ErrorMessage from "../components/ErrorMessage";
import Login from "./Login";

interface Props {
  email: string;
  password: string;
  confirmPassword: string;
}

const initialValues = {
  email: "",
  password: "",
  confirmPassword: "",
};

const onSubmit = (values: Props) => {
  alert(JSON.stringify(values, null, 2));
};

const validate = (values: Props) => {
  let errors = {
    email: "",
    password: "",
    confirmPassword: "",
  };

  if (!values.password) {
    errors.password = "Required";
  }

  if (!values.email) {
    errors.email = "Required";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = "Invalid email format.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Required";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Password not matching.";
  }

  return errors;
};

const Signup = () => {
  const formik = useFormik({
    initialValues,
    onSubmit,
    validate,
  });

  console.log("Form errors: ", formik.errors);
  return (
    <>
      <div className="custom-body-container">
        <div className="left-flex-container">
          <img src="/logo.png" alt="Logo" width="180px" height="150px" />
          <h1>Sign up</h1>
          <span>Welcome to Filiphonics - Let's create an account!</span>
          <form onSubmit={formik.handleSubmit}>
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
            {formik.errors.email ? (
              <ErrorMessage message={formik.errors.email} />
            ) : null}

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
            {formik.errors.password ? (
              <ErrorMessage message={formik.errors.password} />
            ) : null}

            <Input
              htmlFor="confirmPassword"
              inputLabel="Confirm Password"
              placeholder="Re-enter your password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              onChange={formik.handleChange}
              value={formik.values.confirmPassword}
            />
            {formik.errors.confirmPassword ? (
              <ErrorMessage message={formik.errors.confirmPassword} />
            ) : null}

            <button type="submit" className="custom-signin-button">
              Sign up
            </button>
          </form>
          <div>
            <span>Already have an account? </span>
            <Link to="/login">Sign in</Link>
          </div>
        </div>
        <div className="right-flex-container">
          <img src="/poster.png" alt="" width="100%" height="100%" />
        </div>
      </div>
    </>
  );
};

export default Signup;
