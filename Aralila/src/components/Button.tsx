import React, { ReactNode } from "react";

interface ButtonProps {
  label: ReactNode;
  color?: string;
  type: string;
}

const Button = ({ label, color = "primary", type }: ButtonProps) => {
  return (
    // <button className={"btn btn-" + color} type={type}>
    //   {label}
    // </button>
    <button>Submit</button>
  );
};

export default Button;
