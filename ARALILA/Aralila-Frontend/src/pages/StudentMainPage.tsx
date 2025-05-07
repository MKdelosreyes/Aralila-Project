import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidePanel from "../components/SidePanel";
import "../styles/MainPage.css";
import Header from "../components/Header";
import Task from "../components/Task";
import SpellingGame from "../components/games/SpellingGame";

const HomePage = () => {
  const navigate = useNavigate();
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
          <button
            onClick={() => navigate("/game/1")}
            style={{ marginLeft: 250 }}
          >
            <Task imagePath="/task-point.svg" />
          </button>
          <button onClick={SpellingGame} style={{ marginLeft: 200 }}>
            <Task imagePath="/inactive-task-point.svg" />
          </button>
          <button onClick={SpellingGame} style={{ marginLeft: 150 }}>
            <Task imagePath="/inactive-task-point.svg" />
          </button>
          <button style={{ marginLeft: 200 }}>
            <Task imagePath="/inactive-task-point.svg" />
          </button>
          <button style={{ marginLeft: 250 }}>
            <Task imagePath="/inactive-task-point.svg" />
          </button>
          <button style={{ marginLeft: 300 }}>
            <Task imagePath="/inactive-task-point.svg" />
          </button>

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
