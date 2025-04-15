import React from "react";
import SidePanel from "../components/SidePanel";

const LeaderBoards = () => {
  return (
    <div>
      <SidePanel
        tab_1_isActive={false}
        tab_2_isActive={false}
        tab_3_isActive={true}
        tab_4_isActive={false}
      ></SidePanel>
    </div>
  );
};

export default LeaderBoards;
