import React from "react";
import SidePanel from "../components/SidePanel";

const ProfilePage = () => {
  return (
    <div>
      <SidePanel
        tab_1_isActive={false}
        tab_2_isActive={false}
        tab_3_isActive={false}
        tab_4_isActive={true}
      ></SidePanel>
    </div>
  );
};

export default ProfilePage;
