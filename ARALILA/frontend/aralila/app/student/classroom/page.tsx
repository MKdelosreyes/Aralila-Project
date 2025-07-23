"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  FiMessageSquare,
  FiClipboard,
  FiCalendar,
  FiInfo,
  FiX,
} from "react-icons/fi";

// Main layout components
import FullscreenMenu from "@/components/student/fullscreen-menu";
import Sidebar from "@/components/student/sidebar";
import Header from "@/components/student/header";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
// Import the extensive mock data
import { classroomData } from "./mock-data";

type Tab = "activities" | "discussion";

// Enhanced mock data with scores and extended dates
const enhancedActivities = [
  {
    id: 1,
    title: "Sanaysay sa Epekto ng Kapaligiran",
    type: "Assignment",
    startDate: "2024-07-15",
    endDate: "2024-07-25",
    score: 85,
    maxScore: 100,
    timeRemaining: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  },
  {
    id: 2,
    title: "Midterm na Pagsusulit",
    type: "Exam",
    startDate: "2024-07-18",
    endDate: "2024-07-20",
    score: 0,
    maxScore: 100,
    timeRemaining: 2 * 24 * 60 * 60 * 1000, // 2 days
  },
  {
    id: 3,
    title: "Presentasyon ng Proyektong Panggrupo",
    type: "Project",
    startDate: "2024-07-10",
    endDate: "2024-07-30",
    score: 92,
    maxScore: 100,
    timeRemaining: 12 * 24 * 60 * 60 * 1000, // 12 days
  },
  {
    id: 4,
    title: "Lingguhang Pagsusulit Kabanata 5",
    type: "Quiz",
    startDate: "2024-07-16",
    endDate: "2024-07-22",
    score: 78,
    maxScore: 100,
    timeRemaining: 4 * 24 * 60 * 60 * 1000, // 4 days
  },
  {
    id: 5,
    title: "Draft ng Research Paper",
    type: "Assignment",
    startDate: "2024-07-12",
    endDate: "2024-07-28",
    score: 0,
    maxScore: 100,
    timeRemaining: 10 * 24 * 60 * 60 * 1000, // 10 days
  },
];

// Circular Progress Component
const CircularProgress = ({
  value,
  maxValue,
  size = 60,
  strokeWidth = 6,
  color = "#6d28d9",
  label,
  sublabel,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (value / maxValue) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-300 dark:text-gray-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "circOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-sm font-bold text-slate-800 dark:text-white">
          {label}
        </span>
        {sublabel && (
          <span className="text-xs text-slate-500 dark:text-gray-400">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

// Timer Progress Component
const TimerProgress = ({
  timeRemaining,
  totalTime,
  size = 90,
  strokeWidth = 10,
}) => {
  const [currentTime, setCurrentTime] = useState(timeRemaining);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime((prev) => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(currentTime / (24 * 60 * 60 * 1000));
  const hours = Math.floor(
    (currentTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
  );
  const minutes = Math.floor((currentTime % (60 * 60 * 1000)) / (60 * 1000));

  const progress = Math.max(0, (currentTime / totalTime) * 100);
  const color =
    progress > 50 ? "#10b981" : progress > 25 ? "#f59e0b" : "#ef4444";

  return (
    <CircularProgress
      value={progress}
      maxValue={100}
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      label={`${days}d`}
      sublabel={`${hours}h ${minutes}m`}
    />
  );
};

export default function ClassroomPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("activities");
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);
  const [isInfoHovered, setInfoHovered] = useState(false);

  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeInOut" },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <FullscreenMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <ClassInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setInfoModalOpen(false)}
      />

      {/* Background */}
      <AnimatedBackground />

      <Sidebar />

      <main className="relative z-10 flex items-center justify-center h-full p-4 pt-24 pb-10 md:p-8 md:pl-24 md:pt-28 md:pb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col w-full max-w-7xl h-full
                          bg-white/80 border-slate-200/80 shadow-2xl shadow-slate-500/20
                          dark:bg-slate-900/60 dark:border-white/10 dark:shadow-purple-500/10
                          backdrop-blur-3xl border rounded-2xl overflow-hidden"
        >
          {/* Container Header */}
          <div className="relative p-5 md:p-6 border-b flex-shrink-0 border-slate-200 dark:border-white/10 overflow-hidden">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 z-0">
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    "linear-gradient(45deg, rgba(91, 33, 182, 0.2), rgba(30, 64, 175, 0.2), rgba(136, 19, 55, 0.2))",
                    "linear-gradient(135deg, rgba(136, 19, 55, 0.2), rgba(91, 33, 182, 0.2), rgba(30, 64, 175, 0.2))",
                    "linear-gradient(225deg, rgba(30, 64, 175, 0.2), rgba(136, 19, 55, 0.2), rgba(91, 33, 182, 0.2))",
                    "linear-gradient(315deg, rgba(91, 33, 182, 0.2), rgba(30, 64, 175, 0.2), rgba(136, 19, 55, 0.2))",
                  ],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent dark:via-white/10"
                animate={{ x: ["-100%", "100%"] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 1,
                }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  {classroomData.name}
                </h1>
                <p className="text-sm md:text-md text-slate-500 dark:text-gray-400">
                  Taught by {classroomData.teacher.name}
                </p>
              </div>
              <motion.div
                className="relative"
                onHoverStart={() => setInfoHovered(true)}
                onHoverEnd={() => setInfoHovered(false)}
              >
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setInfoModalOpen(true)}
                  className="p-3 rounded-full bg-slate-200/50 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
                  aria-label="View class information"
                >
                  <FiInfo
                    className="text-slate-700 dark:text-white"
                    size={22}
                  />
                </motion.button>
                <AnimatePresence>
                  {isInfoHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: 10, scale: 0.9 }} // Change y to x
                      animate={{ opacity: 1, x: 0, scale: 1 }} // Change y to x
                      exit={{ opacity: 0, x: 10, scale: 0.9 }} // Change y to x
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-3 py-1.5 bg-slate-800 border border-slate-700 text-white text-sm font-semibold whitespace-nowrap rounded-md shadow-lg z-20" // Adjust classes
                    >
                      View class information
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <div className="flex justify-center p-4 border-b flex-shrink-0 border-slate-200 dark:border-white/10">
            <div className="flex bg-slate-100/80 dark:bg-black/30 rounded-2xl p-1.5 backdrop-blur-sm border border-slate-200/50 dark:border-white/10 space-x-2">
              <TabButton
                icon={<FiClipboard />}
                label="Activities"
                isActive={activeTab === "activities"}
                onClick={() => setActiveTab("activities")}
              />
              <TabButton
                icon={<FiMessageSquare />}
                label="Discussion"
                isActive={activeTab === "discussion"}
                onClick={() => setActiveTab("discussion")}
              />
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-grow p-3 md:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-400/50 dark:scrollbar-thumb-purple-800/60 scrollbar-track-transparent hover:scrollbar-thumb-purple-400 dark:hover:scrollbar-thumb-purple-800">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {activeTab === "activities" && <ActivitiesTab />}
                {activeTab === "discussion" && <DiscussionTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// MODIFIED Activities Tab
const ActivitiesTab = () => (
  <div className="space-y-6 max-w-4xl mx-auto">
    {enhancedActivities.map((activity, i) => (
      <motion.div
        key={activity.id}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
        className="flex flex-col sm:flex-row items-center p-5 sm:p-6 gap-5 sm:gap-6 rounded-2xl transition-all duration-300
                      bg-slate-50/90 hover:bg-white dark:bg-black/30 dark:hover:bg-black/40
                      hover:shadow-xl hover:scale-[1.03] border border-slate-200/50 
                      dark:border-white/10 hover:border-purple-400 dark:hover:border-purple-600"
      >
        {/* Left Side: Activity details */}
        <div className="flex-1 w-full space-y-3">
          <div>
            <span
              className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider
                                bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 rounded-full mb-2"
            >
              {activity.type}
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {activity.title}
            </h3>
          </div>
          <div className="flex flex-col space-y-1 text-sm text-slate-600 dark:text-gray-300">
            <div className="flex items-center space-x-2">
              <FiCalendar className="text-green-500 flex-shrink-0" />
              <span>
                Start:{" "}
                <span className="font-medium">
                  {new Date(activity.startDate).toLocaleDateString()}
                </span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <FiCalendar className="text-red-500 flex-shrink-0" />
              <span>
                Due:{" "}
                <span className="font-medium">
                  {new Date(activity.endDate).toLocaleDateString()}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Progress indicators */}
        <div
          className="flex items-center justify-center sm:justify-end gap-4 flex-shrink-0 w-full sm:w-auto
                      bg-slate-100/80 dark:bg-black/20 p-4 rounded-xl
                      sm:p-0 sm:bg-transparent sm:dark:bg-transparent"
        >
          <div className="text-center">
            <CircularProgress
              value={activity.score}
              maxValue={activity.maxScore}
              size={70}
              strokeWidth={7}
              label={`${activity.score}%`}
              sublabel="Score"
            />
          </div>
          <div className="text-center">
            <TimerProgress
              timeRemaining={activity.timeRemaining}
              totalTime={
                new Date(activity.endDate).getTime() -
                new Date(activity.startDate).getTime()
              }
              size={70}
              strokeWidth={7}
            />
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

// Refined Tab Button Component
const TabButton = ({ label, icon, isActive, onClick }) => (
  <motion.button
    onClick={onClick}
    className="flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-xl transition-colors duration-300 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100 dark:focus-visible:ring-offset-black/30"
    whileHover={{ scale: isActive ? 1.05 : 1.1 }}
    whileTap={{ scale: 0.95 }}
    style={{
      color: isActive ? "white" : "var(--text-color)",
      "--text-color": "hsl(222, 12%, 43%)", // Default text color
    }}
  >
    <AnimatePresence>
      {isActive && (
        <motion.div
          layoutId="active-tab-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-r from-purple-700 to-purple-800 rounded-xl shadow-lg shadow-purple-500/30"
        />
      )}
    </AnimatePresence>
    <span className="relative flex items-center z-10">
      <span className="mr-2 text-lg">{icon}</span>
      {label}
    </span>
  </motion.button>
);

// Discussion Tab
const DiscussionTab = () => (
  <div className="space-y-6 max-w-4xl mx-auto">
    {classroomData.discussions.map((post, i) => (
      <motion.div
        key={post.id}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
        className="flex space-x-4"
      >
        <Image
          src={post.avatar}
          alt={post.author}
          width={40}
          height={40}
          className="rounded-full w-10 h-10 object-cover mt-1 flex-shrink-0"
        />
        <div className="flex-1 p-4 rounded-xl bg-slate-100/80 dark:bg-black/20">
          <div className="flex items-baseline space-x-2">
            <p className="font-bold text-purple-600 dark:text-purple-400">
              {post.author}
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              {post.timestamp}
            </p>
          </div>
          <p className="mt-1 text-slate-700 dark:text-gray-200">
            {post.message}
          </p>
        </div>
      </motion.div>
    ))}
  </div>
);

// Class Info Modal Component
const ClassInfoModal = ({ isOpen, onClose }) => {
  const teachers = classroomData.people.filter((p) => p.role === "Teacher");
  const students = classroomData.people.filter((p) => p.role === "Student");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-white/10"
          >
            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Class Information
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <FiX className="text-slate-500" />
              </motion.button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
              {/* Class Details */}
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2 text-purple-600 dark:text-purple-400">
                  Details
                </h3>
                <p>
                  <strong className="font-medium text-slate-800 dark:text-slate-600">
                    Class Name:
                  </strong>{" "}
                  {classroomData.name}
                </p>
                <p>
                  <strong className="font-medium text-slate-600 dark:text-slate-300">
                    Subject:
                  </strong>{" "}
                  {classroomData.subject}
                </p>
              </div>

              {/* Teachers List */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3 text-purple-600 dark:text-purple-400">
                  Instructors ({teachers.length})
                </h3>
                <div className="space-y-3">
                  {teachers.map((person) => (
                    <PersonCard key={person.id} person={person} />
                  ))}
                </div>
              </div>

              {/* Students List */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-purple-600 dark:text-purple-400">
                  Students ({students.length})
                </h3>
                <div className="space-y-3">
                  {students.map((person) => (
                    <PersonCard key={person.id} person={person} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Person Card for Modal
const PersonCard = ({ person }) => (
  <div className="flex items-center space-x-4 p-3 rounded-lg bg-slate-100/80 dark:bg-black/20 hover:bg-slate-200/80 dark:hover:bg-white/10 transition-colors">
    <div className="relative">
      <Image
        src={person.avatar}
        alt={person.name}
        width={48}
        height={48}
        className="rounded-full w-12 h-12 object-cover border-2 border-white dark:border-slate-600"
      />
      {person.role === "Teacher" && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-800">
          <span className="text-white text-xs font-bold">★</span>
        </div>
      )}
    </div>
    <div>
      <p className="font-semibold text-slate-800 dark:text-white">
        {person.name}
      </p>
      <p className="text-sm text-slate-500 dark:text-gray-400">{person.role}</p>
    </div>
  </div>
);
