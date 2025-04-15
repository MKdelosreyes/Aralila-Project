import React, { useState } from "react";
import { Formik, useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import "../styles/Login.css";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from "../components/LoadingIndicator";

interface LoginProps {
  route: string;
}

interface Props {
  email: string;
  password: string;
}

const validate = (values: Props) => {
  let errors: Partial<Props> = {};

  if (!values.password) {
    errors.password = "Required";
  }

  if (!values.email) {
    errors.email = "Required";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = "Invalid email format.";
  }

  return errors;
};

const Login = ({ route }: LoginProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validate,
    onSubmit: async (values: Props, { setSubmitting }: any) => {
      alert(JSON.stringify(values, null, 2));
      setLoading(true);

      try {
        const res = await api.post(route, values);
        console.log("Login response:", res.data);
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        console.log("Navigating to homepage....");
        navigate("/homepage");
        // navigate("/homepage");
      } catch (error: any) {
        console.error(error);
        alert("Something went wrong!");
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  // console.log("Form values: ", formik.values);
  return (
    <>
      <div className="custom-login-container">
        <div className="child-container">
          <img src="/full-logo.png" alt="Logo" width="35%" height="auto" />
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

            {loading && <LoadingIndicator />}
            <button
              type="submit"
              className="custom-button"
              disabled={formik.isSubmitting}
            >
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
