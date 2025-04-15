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
      <div className="custom-user-icon-container">
        <img src="/panda.png" alt="owl-icon" width="50px" height="auto" />
        <div className="m1-user-name-email-flex">
          <span className="username fs-6">
            <strong>{user?.username}</strong>
          </span>
          <span className="email fs-6">{user?.email}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
