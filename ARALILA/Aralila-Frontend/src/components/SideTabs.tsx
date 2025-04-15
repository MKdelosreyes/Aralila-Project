import React from "react";

interface TabProps {
  tabName: string;
  tabIcon: string;
  altText: string;
  isActive?: boolean;
  onClick: () => void;
}

const SideTabs = ({
  tabName,
  tabIcon,
  altText,
  isActive = false,
  onClick,
}: TabProps) => {
  return (
    <button
      type="button"
      className={`custom-tab-container ${isActive ? "selected" : ""}`}
      onClick={onClick}
      aria-pressed={isActive}
    >
      <img src={tabIcon} alt={altText} className="custom-tab-icon-style" />
      <div className="">{tabName}</div>
    </button>
  );
};

export default SideTabs;
