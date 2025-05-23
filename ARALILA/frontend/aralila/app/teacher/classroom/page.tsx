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
import { student, exercises, categories } from "@/data/mockData";
import ExerciseCard from "@/components/ui/exerciseCard";
import NavItem from "@/components/ui/navItem";
import Layout from "@/components/layout/layout";
import ClassroomInfoCard from "@/components/ui/classroomInfoCard";
import CategoryFilter from "@/components/ui/categoryFilter";
import ProficiencyDistribution from "@/components/ui/proficiencyDistribution";

export default function StudentDashboard() {
  // const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Exercises");

  const filteredExercises =
    selectedCategory === "All Exercises"
      ? exercises
      : exercises.filter((exercise) => exercise.category === selectedCategory);

  return (
    // <div className="flex h-screen bg-gray-50">
    //   {/* Sidebar */}
    //   <div
    //     className={`${
    //       isSidebarOpen ? "w-64" : "w-20"
    //     } bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col`}
    //   >
    //     <div className="p-4 flex items-center justify-between border-b ml-3">
    //       {/* {isSidebarOpen ? (
    //         <Image
    //           src="/images/aralila-logo-exp-pr.svg"
    //           alt="Aralila Logo"
    //           width={160} // adjust as needed
    //           height={40}
    //           priority
    //         />
    //       ) : (
    //         <div className="w-full flex justify-center"></div>
    //       )} */}
    //       <button
    //         onClick={() => setIsSidebarOpen(!isSidebarOpen)}
    //         className="p-1 rounded-full hover:bg-gray-100"
    //       >
    //         {isSidebarOpen ? (
    //           <X className="h-5 w-5" />
    //         ) : (
    //           <Menu className="h-5 w-5" />
    //         )}
    //       </button>
    //     </div>

    //     <div className="flex flex-col flex-grow p-4 space-y-6">
    //       <NavItem
    //         icon={<Home />}
    //         label="Ulat"
    //         isOpen={isSidebarOpen}
    //         isActive={true}
    //       />
    //       <NavItem icon={<Book />} label="Aralin" isOpen={isSidebarOpen} />
    //       <NavItem icon={<User />} label="Pagsusulit" isOpen={isSidebarOpen} />
    //     </div>

    //     <div className="p-4 border-t">
    //       <NavItem
    //         icon={<Settings />}
    //         label="Settings"
    //         isOpen={isSidebarOpen}
    //       />
    //       <NavItem icon={<LogOut />} label="Logout" isOpen={isSidebarOpen} />
    //     </div>
    //   </div>

    //   {/* Main Content */}
    //   <div className="flex-1 flex flex-col overflow-hidden">
    //     {/* Header */}
    //     <header className="bg-white shadow-sm h-16 flex items-center px-6 justify-between">
    //       <div className="flex items-center gap-4">
    //         <div className="relative w-64">
    //           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
    //           <input
    //             type="text"
    //             placeholder="Search exercises..."
    //             className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    //           />
    //         </div>
    //       </div>

    //       <div className="flex items-center gap-4">
    //         <button className="relative p-2 rounded-full hover:bg-gray-100">
    //           <Bell className="h-5 w-5 text-gray-600" />
    //           <span className="absolute top-1 right-1 h-2 w-2 bg-purple-500 rounded-full"></span>
    //         </button>
    //         <div className="flex items-center gap-3">
    //           <span className="text-sm font-medium">{student.name}</span>
    //           <img
    //             src={student.avatar}
    //             alt="User avatar"
    //             className="h-8 w-8 rounded-full"
    //           />
    //         </div>
    //       </div>
    //     </header>

    //     {/* Main Content Area */}
    //     <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
    //       {/* Student Info Card */}
    //       <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
    //         <div className="flex items-start justify-between">
    //           <div className="flex items-center gap-4">
    //             <img
    //               src={student.avatar}
    //               alt="User avatar"
    //               className="h-16 w-16 rounded-full"
    //             />
    //             <div>
    //               <h2 className="text-2xl font-bold">{student.name}</h2>
    //               <p className="text-gray-500">
    //                 {student.grade} • {student.classroom}
    //               </p>
    //               <div className="mt-2 flex items-center space-x-6">
    //                 <div className="flex items-center">
    //                   <div className="text-orange-500 mr-1">🔥</div>
    //                   <span className="text-sm font-medium">
    //                     {student.streakDays} day streak
    //                   </span>
    //                 </div>
    //                 <div className="flex items-center">
    //                   <div className="text-yellow-500 mr-1">⭐</div>
    //                   <span className="text-sm font-medium">
    //                     {student.points} points
    //                   </span>
    //                 </div>
    //                 <div className="flex items-center">
    //                   <div className="text-green-500 mr-1">✓</div>
    //                   <span className="text-sm font-medium">
    //                     {student.completedExercises} exercises
    //                   </span>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //           <div className="bg-purple-100 px-4 py-2 rounded-full">
    //             <span className="text-purple-700 font-medium">
    //               {student.rank}
    //             </span>
    //           </div>
    //         </div>
    //       </div>

    //       {/* Categories */}
    //       <div className="mb-6 flex flex-wrap gap-2">
    //         {categories.map((category) => (
    //           <button
    //             key={category}
    //             onClick={() => setSelectedCategory(category)}
    //             className={`px-4 py-2 rounded-full text-sm font-medium ${
    //               selectedCategory === category
    //                 ? "bg-purple-500 text-white"
    //                 : "bg-white text-gray-600 hover:bg-gray-100"
    //             }`}
    //           >
    //             {category}
    //           </button>
    //         ))}
    //       </div>

    //       {/* Exercises Grid */}
    //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    //         {filteredExercises.map((exercise) => (
    //           <ExerciseCard key={exercise.id} exercise={exercise} />
    //         ))}
    //       </div>
    //     </main>
    //   </div>
    // </div>
    <Layout sidebar={true} student={student}>
      <div className="flex flex-row mb-5 h-48 gap-5">
        <ClassroomInfoCard />
        <ProficiencyDistribution />
      </div>

      <div className="flex bg-white min-h-96 rounded-lg border"></div>

      {/* <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      /> */}

      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div> */}
    </Layout>
  );
}
