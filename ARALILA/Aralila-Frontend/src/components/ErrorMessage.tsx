import React from "react";

interface Props {
  message: string;
}

const ErrorMessage = ({ message }: Props) => {
  return <div className="error-message">{message}</div>;
};

export default ErrorMessage;
