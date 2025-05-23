"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Bell,
  Book,
  BookOpen,
  CheckCircle,
  Crown,
  Home,
  LineChart,
  LogOut,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";

// Mock data
const student = {
  name: "Maria Santos",
  avatar: "/api/placeholder/40/40",
  grade: "Grade 8",
  classroom: "Filipino 101 - Teacher: Ms. Reyes",
  streakDays: 15,
  points: 2450,
  completedExercises: 28,
  rank: "Advanced Learner",
};

const exercises = [
  {
    id: 1,
    title: "Spelling Challenge",
    description: "Correct misspelled words in timed challenges",
    category: "Writing Mechanics",
    progress: 65,
    icon: <Book className="h-8 w-8 text-purple-500" />,
    isNew: false,
  },
  {
    id: 2,
    title: "Punctuation Task",
    description: "Place punctuation marks in scrambled sentences",
    category: "Writing Mechanics",
    progress: 40,
    icon: <MessageSquare className="h-8 w-8 text-purple-500" />,
    isNew: false,
  },
  {
    id: 3,
    title: "Parts of Speech Challenge",
    description: "Identify and classify words into correct parts of speech",
    category: "Writing Mechanics",
    progress: 80,
    icon: <BookOpen className="h-8 w-8 text-purple-500" />,
    isNew: false,
  },
  {
    id: 4,
    title: "Word Association Game",
    description: "Guess words that connect multiple clues or visuals",
    category: "Vocabulary Development",
    progress: 30,
    icon: <LineChart className="h-8 w-8 text-purple-500" />,
    isNew: true,
  },
  {
    id: 5,
    title: "Word Matching Activity",
    description: "Match words to their definitions or usage",
    category: "Vocabulary Development",
    progress: 75,
    icon: <CheckCircle className="h-8 w-8 text-purple-500" />,
    isNew: false,
  },
  {
    id: 6,
    title: "Grammar Check Game",
    description: "Identify errors in fragmented sentences",
    category: "Grammar Accuracy",
    progress: 50,
    icon: <Book className="h-8 w-8 text-purple-500" />,
    isNew: false,
  },
  {
    id: 7,
    title: "Sentence Construction Challenge",
    description: "Rearrange fragments to form coherent sentences",
    category: "Sentence Construction",
    progress: 20,
    icon: <MessageSquare className="h-8 w-8 text-purple-500" />,
    isNew: true,
  },
  {
    id: 8,
    title: "Emoji Sentence Challenge",
    description: "Guess and construct sentences from emoji sequences",
    category: "Sentence Construction",
    progress: 10,
    icon: <BookOpen className="h-8 w-8 text-purple-500" />,
    isNew: true,
  },
  {
    id: 9,
    title: "Paragraph Building Exercise",
    description: "Organize scrambled sentences into coherent paragraphs",
    category: "Creative Storytelling",
    progress: 60,
    icon: <LineChart className="h-8 w-8 text-purple-500" />,
    isNew: false,
  },
  {
    id: 10,
    title: "Story Completion Challenge",
    description: "Fill in missing parts of a story with appropriate text",
    category: "Creative Storytelling",
    progress: 45,
    icon: <CheckCircle className="h-8 w-8 text-purple-500" />,
    isNew: false,
  },
  {
    id: 11,
    title: "Caption This!",
    description: "Write stories based on series of images",
    category: "Creative Storytelling",
    progress: 35,
    icon: <Book className="h-8 w-8 text-purple-500" />,
    isNew: true,
  },
];

export default function StudentDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Exercises");

  const categories = [
    "All Exercises",
    "Writing Mechanics",
    "Vocabulary Development",
    "Grammar Accuracy",
    "Sentence Construction",
    "Creative Storytelling",
  ];

  const filteredExercises =
    selectedCategory === "All Exercises"
      ? exercises
      : exercises.filter((exercise) => exercise.category === selectedCategory);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b ml-3">
          {isSidebarOpen ? (
            <Image
              src="/images/aralila-logo-exp-pr.svg"
              alt="Aralila Logo"
              width={160} // adjust as needed
              height={40}
              priority
            />
          ) : (
            <div className="w-full flex justify-center"></div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="flex flex-col flex-grow p-4 space-y-6">
          <NavItem
            icon={<Home />}
            label="Dashboard"
            isOpen={isSidebarOpen}
            isActive={true}
          />
          <NavItem
            icon={<Book />}
            label="My Exercises"
            isOpen={isSidebarOpen}
          />
          <NavItem
            icon={<Crown />}
            label="Achievements"
            isOpen={isSidebarOpen}
          />
          <NavItem
            icon={<LineChart />}
            label="Progress"
            isOpen={isSidebarOpen}
          />
          <NavItem
            icon={<MessageSquare />}
            label="Messages"
            isOpen={isSidebarOpen}
          />
          <NavItem icon={<User />} label="Profile" isOpen={isSidebarOpen} />
        </div>

        <div className="p-4 border-t">
          <NavItem
            icon={<Settings />}
            label="Settings"
            isOpen={isSidebarOpen}
          />
          <NavItem icon={<LogOut />} label="Logout" isOpen={isSidebarOpen} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center px-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search exercises..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-purple-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{student.name}</span>
              <img
                src={student.avatar}
                alt="User avatar"
                className="h-8 w-8 rounded-full"
              />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Student Info Card */}
          <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={student.avatar}
                  alt="User avatar"
                  className="h-16 w-16 rounded-full"
                />
                <div>
                  <h2 className="text-2xl font-bold">{student.name}</h2>
                  <p className="text-gray-500">
                    {student.grade} • {student.classroom}
                  </p>
                  <div className="mt-2 flex items-center space-x-6">
                    <div className="flex items-center">
                      <div className="text-orange-500 mr-1">🔥</div>
                      <span className="text-sm font-medium">
                        {student.streakDays} day streak
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="text-yellow-500 mr-1">⭐</div>
                      <span className="text-sm font-medium">
                        {student.points} points
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="text-green-500 mr-1">✓</div>
                      <span className="text-sm font-medium">
                        {student.completedExercises} exercises
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-purple-100 px-4 py-2 rounded-full">
                <span className="text-purple-700 font-medium">
                  {student.rank}
                </span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === category
                    ? "bg-purple-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Exercises Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, isOpen, isActive = false }) {
  //ma run rani error ra tungod sa safety issues ni typescript
  return (
    <div
      className={`flex items-center p-2 cursor-pointer rounded-lg ${
        isActive
          ? "bg-purple-100 text-purple-700"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <div className="w-5 h-5 mr-3">{icon}</div>
      {isOpen && <span className="font-medium">{label}</span>}
    </div>
  );
}

function ExerciseCard({ exercise }) {
  //ma run rani error ra tungod sa safety issues ni typescript
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="rounded-full bg-purple-100 p-3">{exercise.icon}</div>
          <div className="flex items-center space-x-2">
            {exercise.isNew && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                NEW
              </span>
            )}
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        <h3 className="mt-4 text-lg font-bold">{exercise.title}</h3>
        <p className="text-gray-500 text-sm mt-1">{exercise.description}</p>

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium">{exercise.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full"
              style={{ width: `${exercise.progress}%` }}
            ></div>
          </div>
        </div>

        <button className="mt-4 w-full py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors">
          Continue Learning
        </button>
      </div>
    </div>
  );
}
