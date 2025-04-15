import React from "react";
import SidePanel from "../components/SidePanel";

const QuestPage = () => {
  return (
    <div>
      <SidePanel
        tab_1_isActive={false}
        tab_2_isActive={true}
        tab_3_isActive={false}
        tab_4_isActive={false}
      ></SidePanel>
    </div>
  );
};

export default QuestPage;
