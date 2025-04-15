import React from "react";
import SidePanel from "../components/SidePanel";
import "../styles/MainPage.css";
import Header from "../components/Header";

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
        <Header></Header>
      </div>
    </div>
  );
};

export default HomePage;
