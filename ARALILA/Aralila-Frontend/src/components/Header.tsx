import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useNavigate } from "react-router-dom";

interface Props {
  email: string;
  password: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role?: string;
}

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      const res = await axios.get("/api/profile/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(res.data);
      setUser(res.data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="custom-header-container">
      <div className="custom-user-points-styles">
        <img src="/points.png" alt="star-icon" width="40px" height="auto" />
        <span>23425</span>
      </div>
      <div className="custom-user-life-styles">
        <img src="/life.png" alt="heart-icon" width="30px" height="auto" />
        <span>5</span>
      </div>
      <div className="custom-user-role-styles">STUDENT</div>
      <div className="custom-user-icon-container">
        <img src="/panda.png" alt="owl-icon" width="50px" height="auto" />
        <div className="m1-user-name-email-flex">
          <span className="username fs-6">
            <strong>{user?.username}</strong>
          </span>
          <span className="email">{user?.email}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
