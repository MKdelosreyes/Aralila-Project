"use client";

import Layout from "@/components/layout/layout";
import React, { ReactNode } from "react";
import { useState, useEffect } from "react";
import { student, teacher } from "@/data/mockData";
import { ClassCard } from "@/components/ui/classCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { authAPI } from "@/lib/api/auth";
import { classroomAPI } from "@/lib/api/classroom";
import CreateClassroomModal from "@/components/forms/createClassroomModal";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  school_name: string;
  profile_pic: string;
  role: string;
}

interface Classroom {
  id: number;
  teacher: ReactNode;
  class_name: string;
  section: string;
  subject: string;
  semester: string;
  class_key: string;
  created_at: Date;
  isActive: boolean;
}

export default function TeacherHomePage() {
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "active", "inactive"
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [classes, setClasses] = useState<Classroom[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await authAPI.getProfile();
        console.log("Retrieved user profile successfully...");
        setUser(userData);

        const classroomData = await classroomAPI.getAllClassrooms();
        console.log("Retrieved classes successfully!");
        setClasses(classroomData);
      } catch (err) {
        console.log(error);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateClassroom = async (data: {
    name: string;
    section: string;
    classKey: string;
  }) => {
    try {
      await fetch("/api/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Classroom creation failed:", error);
    }
  };

  console.log(classes?.length);

  // Filter classes based on status and search term
  const filteredClasses = classes?.filter((classItem) => {
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && classItem.isActive) ||
      (filterStatus === "inactive" && !classItem.isActive);

    const matchesSearch =
      classItem.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.section;

    return matchesStatus && matchesSearch;
  });

  return (
    <Layout sidebar={true} user={user}>
      <div className="flex gap-8">
        {/* Main Content */}
        <main className="flex-1 pt-5 pl-5">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
              My Classes
            </h1>
            <p className="text-gray-500 text-base">
              Manage and monitor your classroom activities
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex gap-2">
              <Button
                onClick={() => setFilterStatus("all")}
                variant={filterStatus === "all" ? "default" : "outline"}
                className={
                  filterStatus === "all"
                    ? "bg-purple-500 hover:bg-purple-600 text-white"
                    : ""
                }
              >
                All Classes ({classes?.length ?? 0})
              </Button>
              <Button
                onClick={() => setFilterStatus("active")}
                variant={filterStatus === "active" ? "default" : "outline"}
                className={
                  filterStatus === "active"
                    ? "bg-purple-500 hover:bg-purple-600 text-white"
                    : ""
                }
              >
                Active ({classes?.filter((c) => c.isActive).length ?? 0})
              </Button>
              <Button
                onClick={() => setFilterStatus("inactive")}
                variant={filterStatus === "inactive" ? "default" : "outline"}
                className={
                  filterStatus === "inactive"
                    ? "bg-purple-500 hover:bg-purple-600 text-white"
                    : ""
                }
              >
                Inactive ({classes?.filter((c) => !c.isActive).length ?? 0})
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredClasses?.map((classItem) => (
              <ClassCard key={classItem.id} classInfo={classItem} />
            ))}
          </div>
          {filteredClasses?.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4 text-4xl">📚</div>
              <h3 className="text-lg font-medium text-gray-700">
                No classes found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </main>

        {/* Sidebar*/}
        <aside className="w-110 flex-shrink-0 py-7 px-8 bg-gradient-to-r from-indigo-400 to-purple-700 rounded-lg">
          <div className="rounded-2xl shadow flex flex-col items-center mb-6">
            <img
              src={user?.profile_pic}
              alt="Teacher avatar"
              className="h-20 w-20 rounded-full mb-2 object-cover border-4 border-purple-100"
            />
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-purple-300 font-medium text-sm">
                {user?.school_name}
              </p>
            </div>
          </div>
          <div className="space-y-3 mb-6">
            <div className="bg-purple-50 rounded-xl p-4 flex items-center gap-3">
              <span className="text-purple-500 text-2xl">
                <i className="fa fa-graduation-cap" />
              </span>
              <div>
                <div className="text-lg font-bold text-purple-700">
                  {classes?.length ?? 0}
                </div>
                <div className="text-xs text-purple-700 font-medium">
                  Total Classes
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
              <span className="text-blue-500 text-2xl">
                <i className="fa fa-users" />
              </span>
              <div>
                <div className="text-lg font-bold text-blue-700">
                  {teacher.totalStudents}
                </div>
                <div className="text-xs text-blue-700 font-medium">
                  Total Students
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
              <span className="text-green-500 text-2xl">
                <i className="fa fa-award" />
              </span>
              <div>
                <div className="text-lg font-bold text-green-700">72%</div>
                <div className="text-xs text-green-700 font-medium">
                  Avg. Score
                </div>
              </div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 flex items-center gap-3">
              <span className="text-orange-500 text-2xl">
                <i className="fa fa-arrow-up-right" />
              </span>
              <div>
                <div className="text-lg font-bold text-orange-700">8</div>
                <div className="text-xs text-orange-700 font-medium">
                  Active Tasks
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <CreateClassroomModal
              onCreate={handleCreateClassroom}
              // userID={user?.id}
            />
          </div>
        </aside>
      </div>
    </Layout>
  );
}
