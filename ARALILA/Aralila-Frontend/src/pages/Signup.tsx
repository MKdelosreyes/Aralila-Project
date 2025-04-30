import React, { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Signup.css";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { Formik, useFormik } from "formik";
import Input from "../components/Input";
import ErrorMessage from "../components/ErrorMessage";
import Login from "./Login";
import LoadingIndicator from "../components/LoadingIndicator";
import axios, { AxiosError } from "axios";

interface SignupProps {
  route: string;
}

interface Props {
  email: string;
  password: string;
  confirmPassword: string;
}

const validate = (values: Props) => {
  let errors: Partial<Props> = {};

  console.log("Validation errors:", errors);

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

const Signup = ({ route }: SignupProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const initialValues = {
    email: "",
    password: "",
    confirmPassword: "",
  };

  const formik = useFormik({
    initialValues,
    onSubmit: async (values: Props, { setSubmitting }: any) => {
      console.log("SIGNING INNNNN");
      alert(JSON.stringify(values, null, 2));
      setLoading(true);

      console.log("Printing this line...");
      try {
        const res = await api.post(route, {
          email: values.email,
          password: values.password,
        });
        navigate("/homepage");
      } catch (error: any) {
        console.error(error);
        alert("Something went wrong!");
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
    validate,
  });

  return (
    <>
      <div className="custom-signup-container">
        <div className="left-flex-container">
          <img
            src="/logo.png"
            alt="Logo"
            width="150px"
            height="120px"
            className="custom-logo-signup"
          />
          <h1>Sign up</h1>
          <span>Welcome to Filiphonics - Let's create an account!</span>
          {/* <div className="register-status-bar">
            <div className="status-1">
              <span>Role</span>
              <div className="status-bar-1"></div>
            </div>
            <div className="status-2">
              <span>Personal</span>
              <div className="status-bar-2"></div>
            </div>
            <div className="status-3">
              <span>Account</span>
              <div className="status-bar-3"></div>
            </div>
          </div> */}
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

            {loading && <LoadingIndicator />}
            <button
              type="submit"
              className="custom-signin-button"
              disabled={formik.isSubmitting}
            >
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

// const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     role: "",
//     first_name: "",
//     last_name: "",
//     school_name: "",
//     email: "",
//     password: "",
//   });

//   const next = () => setStep((prev) => prev + 1);
//   const prev = () => setStep((prev) => prev - 1);

//   const updateField = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10">
//       {step === 1 && <StepRole next={next} updateField={updateField} />}
//       {step === 2 && <StepDetails next={next} prev={prev} updateField={updateField} />}
//       {step === 3 && <StepAccount formData={formData} updateField={updateField} prev={prev} />}
//     </div>
//   );
// };
