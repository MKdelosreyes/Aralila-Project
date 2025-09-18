// import React, { ReactNode } from "react";
// import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "@/lib/api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/lib/constants";
import React, { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/router";

interface Props {
  children: ReactNode;
}

interface JwtPayload {
  exp: number;
}

const ProtectedRoute = ({ children }: Props) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) {
        setIsAuthorized(false);
        router.push("/about"); // redirect if no token
        return;
      }

      const decoded = jwtDecode<JwtPayload>(token);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        await refreshToken();
      } else {
        setIsAuthorized(true);
      }
    };

    const refreshToken = async () => {
      const refresh = localStorage.getItem(REFRESH_TOKEN);
      if (!refresh) {
        setIsAuthorized(false);
        router.push("/about");
        return;
      }

      try {
        const res = await api.post("/api/token/refresh/", { refresh });
        if (res.status === 200) {
          localStorage.setItem(ACCESS_TOKEN, res.data.access);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.push("/about");
        }
      } catch (error) {
        console.error(error);
        setIsAuthorized(false);
        router.push("/about");
      }
    };

    checkAuth();
  }, []);

  if (isAuthorized === null) {
    return <div>Loading...</div>; // optional: show spinner
  }

  return isAuthorized ? children : null;
};

export default ProtectedRoute;
