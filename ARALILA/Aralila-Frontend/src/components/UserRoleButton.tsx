import React from "react";

interface Props {
  children: string;
  onClick: () => void;
  className: string;
}

const UserRole = ({ children, onClick, className }: Props) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`custom-user-role-btn ${className}`} // Set width and height to make it square // Adjusted padding and border radius
    >
      {children}
    </button>
  );
};

export default UserRole;
