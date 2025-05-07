import React from "react";

interface StepProp {
  step: number;
}

const Stepper = ({ step }: StepProp) => {
  return (
    <div className="register-status-bar">
      <div className="status-1">
        <span className="status-span-active">Role</span>
        <div className="status-bar-1 status-div-active"></div>
      </div>
      <div className="status-2">
        <span
          className={step < 2 ? "status-span-inactive" : "status-span-active"}
        >
          Personal
        </span>
        <div
          className={`status-bar-2 ${
            step < 2 ? "status-div-inactive" : "status-div-active"
          }`}
        ></div>
      </div>
      <div className="status-3">
        <span
          className={step < 3 ? "status-span-inactive" : "status-span-active"}
        >
          Account
        </span>
        <div
          className={`status-bar-3 ${
            step < 3 ? "status-div-inactive" : "status-div-active"
          }`}
        ></div>
      </div>
    </div>
  );
};

export default Stepper;
