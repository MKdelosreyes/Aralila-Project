import { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  BrowserRouter,
} from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import StudentMainPage from "./pages/StudentMainPage";
import TeacherMainPage from "./pages/TeacherMainPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import QuestPage from "./pages/QuestPage";
import LeaderBoards from "./pages/LeaderBoards";
import ProfilePage from "./pages/ProfilePage";
import GameLevel from "./pages/GameLevel";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Signup route="api/user/register/" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login route="api/token/" />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/signup" element={<RegisterAndLogout />} />
        {/* <Route path="/signup" element={<Signup route="api/user/register/" />} /> */}
        <Route
          path="/homepage/student-view"
          element={
            <ProtectedRoute>
              <StudentMainPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/homepage/teacher-view"
          element={
            <ProtectedRoute>
              <TeacherMainPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quests"
          element={
            <ProtectedRoute>
              <QuestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboards"
          element={
            <ProtectedRoute>
              <LeaderBoards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile-page"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game/:levelId"
          element={
            <ProtectedRoute>
              <GameLevel />
            </ProtectedRoute>
          }
        />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
