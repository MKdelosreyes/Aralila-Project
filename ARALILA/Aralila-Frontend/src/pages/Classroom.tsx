import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidePanel from "../components/SidePanel";
import "../styles/MainPage.css";
import "../styles/Classroom.css";
import Header from "../components/Header";

// Define TypeScript interfaces
interface ClassData {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
}

const Classroom: React.FC = () => {
  const navigate = useNavigate();
  const [classCode, setClassCode] = useState<string>("");
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string>("");
  const [showToast, setShowToast] = useState<boolean>(false); // State for the toast message

  // Mock class data
  const [classes, setClasses] = useState<ClassData[]>([
    {
      id: 1,
      title: "FILIPINO031",
      subtitle: "F1",
      imageUrl: "/logo.png",
    },
    {
      id: 2,
      title: "FILIPINO031",
      subtitle: "F2",
      imageUrl: "/logo.png",
    },
  ]);

  const handleJoinClass = (): void => {
    if (!classCode.trim()) {
      setJoinError("Please enter a class code");
      return;
    }

    setShowToast(true); // Show the toast message
    setShowJoinModal(false); // Close the modal
    setClassCode("");
    setJoinError("");

    // Simulate the delay and then hide the toast
    setTimeout(() => {
      setShowToast(false);
    }, 3000); // Adjust the duration as needed
  };

  const handleCloseToast = (): void => {
    setShowToast(false);
  };

  const openClass = (classId: number): void => {
    // Navigate to the ClassroomView component with the class ID
    navigate(`/classroom/${classId}`);
  };

  return (
    <div className="custom-homepage-container">
      <SidePanel
        tab_1_isActive={true}
        tab_2_isActive={false}
        tab_3_isActive={false}
        tab_4_isActive={false}
      />
      <div className="custom-page-container">
        <h1 className="classroom-title">My Classes</h1>

        {showToast && (
          <div className="toast-notification">
            Class join request sent! Please wait for your teacher's approval.
            <button className="toast-close-button" onClick={handleCloseToast}>
              &times;
            </button>
          </div>
        )}

        <div className="classes-grid">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className="class-card"
              onClick={() => openClass(classItem.id)}
            >
              <div className="class-card-bg" style={{ backgroundColor: "#C085E9" }}>
                <img src={classItem.imageUrl} alt={classItem.title} className="class-logo" />
              </div>
              <div className="class-card-content">
                <h3 className="class-card-title">{classItem.title}</h3>
                <p className="class-card-subtitle">{classItem.subtitle}</p>
              </div>
            </div>
          ))}

          <div
            className="class-card join-card"
            onClick={() => setShowJoinModal(true)}
          >
            <div className="join-card-content">
              <span className="join-icon">+</span>
              <p className="join-text">Join class</p>
            </div>
          </div>
        </div>

        {/* Join Class Modal */}
        {showJoinModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ backgroundColor: "#fff", borderRadius: "12px" }}>
              <h2>Join a Class</h2>
              <p>Enter the class code provided by your teacher.</p>

              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                placeholder="Enter class code"
                className="class-code-input"
              />

              {joinError && <p className="error-message">{joinError}</p>}

              <div className="modal-buttons">
                <button
                  className="cancel-button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setClassCode("");
                    setJoinError("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="join-button"
                  onClick={handleJoinClass}
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="custom-right-side-panel">
        <Header />
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

export default Classroom;