import React from "react";
import SidePanel from "../components/SidePanel";
import "../styles/MainPage.css";
import Header from "../components/Header";
import Task from "../components/Task";

const HomePage = () => {
  return (
    <div className="custom-homepage-container">
      <SidePanel
        tab_1_isActive={true}
        tab_2_isActive={false}
        tab_3_isActive={false}
        tab_4_isActive={false}
      ></SidePanel>
      <div className="custom-page-container">
        <div className="custom-page-title-heading">
          MODULE 1: Enhancing Writing Mechanics in Filipino
        </div>
        <div className="custom-page-main-body">
          <Task imagePath="/task-point.svg" marginLeft="150px" />
          <Task imagePath="/inactive-task-point.svg" marginLeft="100px" />
          <Task imagePath="/inactive-task-point.svg" marginLeft="50px" />
          <Task imagePath="/inactive-task-point.svg" marginLeft="100px" />
          <Task imagePath="/inactive-task-point.svg" marginLeft="150px" />
          <Task imagePath="/inactive-task-point.svg" marginLeft="200px" />
          {/* <Task imagePath="/inactive-task-point.svg" marginLeft="250px" /> */}
        </div>
      </div>
      <div className="custom-right-side-panel">
        <Header></Header>
        <div className="leaderboard-card">
          <h3 className="leaderboard-title">Explore Daily Quests!</h3>
          <div className="leaderboard-content">
            <div className="leaderboard-icon">
              <img src="/quest.png" alt="" width="30px" />
            </div>
            <p className="leaderboard-description">
              <strong>No</strong> daily quests logged...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
