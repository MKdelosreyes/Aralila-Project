import React, { ReactNode } from "react";
import "../styles/Components.css";

interface InputProps {
  htmlFor: string;
  inputLabel: string;
  placeholder: string;
  id: string;
  name: string;
  type: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
}

const Input = ({
  htmlFor,
  inputLabel,
  placeholder,
  id,
  name,
  type,
  onChange,
  value,
}: InputProps) => {
  return (
    <div className="custom-input-container">
      <label htmlFor={htmlFor} className="custom-label">
        {inputLabel}
      </label>
      <input
        className="form-control custom-input-text"
        placeholder={placeholder}
        style={{
          padding: "8px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
        id={id}
        name={name}
        type={type}
        onChange={onChange}
        value={value}
      />
    </div>
  );
};

export default Input;
