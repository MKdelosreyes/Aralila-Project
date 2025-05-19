import React, { ReactNode, useEffect, useState } from "react";
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
import UserRoleButton from "../components/UserRoleButton";
import Stepper from "../components/Stepper";

interface SignupProps {
  route: string;
}

interface Props {
  role: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const validate = (values: Props) => {
  let errors: Partial<Props> = {};

  console.log("Validation errors:", errors);

  if (!values.role) {
    errors.role = "Required";
  }

  if (!values.first_name) {
    errors.first_name = "Required";
  }

  if (!values.last_name) {
    errors.last_name = "Required";
  }

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
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const initialValues = {
    role: "",
    first_name: "",
    last_name: "",
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
          role: values.role,
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          password: values.password,
        });
        navigate("/login");
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

  const renderStepFields = () => {
    switch (step) {
      case 1:
        return (
          <div className="custom-user-role-container">
            {/* <h1 className="text-3xl font-bold text-black-500 mb-4">
              Choose your role
            </h1> */}
            <h6 className="text-xs text-black-500 mb-4 addinter">
              Are you a teacher or a student?
            </h6>
            <div className="custom-user-role-btn-container">
              <UserRoleButton
                onClick={() => {
                  formik.setFieldValue("role", "student");
                  console.log("Student is clicked.");
                }}
                className={`${
                  formik.values.role === "student"
                    ? "user-role-btn-active "
                    : ""
                } `}
              >
                Student
              </UserRoleButton>
              <UserRoleButton
                onClick={() => {
                  formik.setFieldValue("role", "teacher");
                  console.log("Teacher is clicked.");
                }}
                className={`${
                  formik.values.role === "teacher" ? "user-role-btn-active" : ""
                }`}
              >
                Teacher
              </UserRoleButton>
            </div>
          </div>
        );
      case 2:
        return (
          <>
            <Input
              htmlFor="first_name"
              inputLabel="First Name"
              placeholder="Enter first name"
              id="first_name"
              name="first_name"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.first_name}
            />
            {formik.errors.first_name ? (
              <ErrorMessage message={formik.errors.first_name} />
            ) : null}
            <Input
              htmlFor="last_name"
              inputLabel="Last Name"
              placeholder="Enter last name"
              id="last_name"
              name="last_name"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.last_name}
            />
            {formik.errors.last_name ? (
              <ErrorMessage message={formik.errors.last_name} />
            ) : null}
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
          </>
        );
      case 3:
        return (
          <>
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
          </>
        );
      default:
        return null;
    }
  };

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
          <h2>Sign up</h2>
          <span>Welcome to Filiphonics - Let's create an account!</span>
          <Stepper step={step} />
          <form onSubmit={formik.handleSubmit}>
            {renderStepFields()}
            {/* {loading && <LoadingIndicator />} */}
            <div className="custom-prev-next-btn-container">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="custom-prev-step-register-btn"
                >
                  Previous
                </button>
              )}
              <button
                type={step === 3 ? "submit" : "button"}
                className={
                  step === 3
                    ? "custom-submit-register-btn"
                    : "custom-next-step-register-btn"
                }
                disabled={formik.isSubmitting}
                onClick={() => {
                  if (step < 3) {
                    // Validate current step before proceeding
                    const errors = validate(formik.values);

                    if (step === 1 && !formik.values.role) {
                      alert("Please select a role to proceed.");
                      return;
                    }

                    if (step === 2) {
                      if (
                        !formik.values.first_name ||
                        !formik.values.last_name ||
                        !formik.values.email
                      ) {
                        alert("Please complete all fields before continuing.");
                        return;
                      }
                      if (
                        errors.first_name ||
                        errors.last_name ||
                        errors.email
                      ) {
                        formik.setTouched({
                          first_name: true,
                          last_name: true,
                          email: true,
                        });
                        alert("Please fix the errors before continuing.");
                        return;
                      }
                    }

                    setStep(step + 1);
                  }
                }}
              >
                {step === 3 ? "Submit" : "Next"}
              </button>
            </div>
          </form>
          <div className="custom-prompt-existing-account">
            <span>Already have an account? </span>
            <Link to="/login">Sign in</Link>
          </div>
        </div>
        <div className="right-flex-container">
          <img src="/poster.png" alt="" width="87%" height="auto" />
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
