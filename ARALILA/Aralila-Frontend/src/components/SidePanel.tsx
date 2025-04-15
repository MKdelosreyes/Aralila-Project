import React from "react";
import SideTabs from "./SideTabs";
import { Navigate, useNavigate } from "react-router-dom";

interface Props {
  tab_1_isActive: boolean;
  tab_2_isActive: boolean;
  tab_3_isActive: boolean;
  tab_4_isActive: boolean;
}

const SidePanel = ({
  tab_1_isActive,
  tab_2_isActive,
  tab_3_isActive,
  tab_4_isActive,
}: Props) => {
  const navigate = useNavigate();
  return (
    <div className="custom-side-panel-container">
      <img src="/full-logo.png" alt="logo-icon" width="85%" height="auto" />
      <div className="custom-tab-group-container">
        <SideTabs
          tabName="Learn"
          tabIcon="/learn.png"
          altText="None"
          isActive={tab_1_isActive}
          onClick={() => {
            tab_1_isActive = true;
            tab_2_isActive = false;
            tab_3_isActive = false;
            tab_4_isActive = false;
            if (tab_1_isActive) {
              navigate("/homepage");
            }
          }}
        />

        <SideTabs
          tabName="Quest"
          tabIcon="/quest.png"
          altText="None"
          isActive={tab_2_isActive}
          onClick={() => {
            tab_1_isActive = false;
            tab_2_isActive = true;
            tab_3_isActive = false;
            tab_4_isActive = false;
            if (tab_2_isActive) {
              navigate("/quests");
            }
          }}
        />

        <SideTabs
          tabName="Leaderboards"
          tabIcon="/leaderboard.png"
          altText="None"
          isActive={tab_3_isActive}
          onClick={() => {
            tab_1_isActive = false;
            tab_2_isActive = false;
            tab_3_isActive = true;
            tab_4_isActive = false;
            if (tab_3_isActive) {
              navigate("/leaderboards");
            }
          }}
        />

        <SideTabs
          tabName="Profile"
          tabIcon="/profile.png"
          altText="None"
          isActive={tab_4_isActive}
          onClick={() => {
            tab_1_isActive = false;
            tab_2_isActive = false;
            tab_3_isActive = false;
            tab_4_isActive = true;
            if (tab_4_isActive) {
              navigate("/profile-page");
            }
          }}
        />
      </div>
    </div>
  );
};

export default SidePanel;
