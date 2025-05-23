"use client";

import Layout from "@/components/layout/layout";
import React from "react";
import { useState, useEffect } from "react";
import { student, teacher, classes } from "@/data/mockData";
import { ClassCard } from "@/components/ui/classCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { authAPI } from "@/lib/api/auth";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  school_name: string;
  role: string;
}

export default function TeacherHomePage() {
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "active", "inactive"
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const fetchProfile = async () => {
    try {
      const res = await authAPI.getProfile();
      console.log("Retrieved user data successfully...");
      setUser(res);
    } catch (error) {
      console.error("Failed to fetch profile", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Filter classes based on status and search term
  const filteredClasses = classes.filter((classItem) => {
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && classItem.isActive) ||
      (filterStatus === "inactive" && !classItem.isActive);

    const matchesSearch =
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.grade.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <Layout sidebar={false} user={user}>
      {/* Teacher Info Card */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img
                src={teacher.avatar}
                alt="Teacher avatar"
                className="h-16 w-16 rounded-full"
              />
              <div>
                <h2 className="text-2xl font-bold">
                  {user?.first_name + " " + user?.last_name}
                </h2>
                <p className="text-gray-500">{user?.school_name}</p>
                <div className="mt-2 flex items-center space-x-6">
                  <div className="flex items-center">
                    <div className="text-purple-500 mr-1">📚</div>
                    <span className="text-sm font-medium">
                      {teacher.totalClasses} classes
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="text-blue-500 mr-1">👥</div>
                    <span className="text-sm font-medium">
                      {teacher.totalStudents} students
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Button className="bg-purple-500 hover:bg-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Class
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Button
            onClick={() => setFilterStatus("all")}
            variant={filterStatus === "all" ? "default" : "outline"}
            className={
              filterStatus === "all" ? "bg-purple-500 hover:bg-purple-600" : ""
            }
          >
            All Classes
          </Button>
          <Button
            onClick={() => setFilterStatus("active")}
            variant={filterStatus === "active" ? "default" : "outline"}
            className={
              filterStatus === "active"
                ? "bg-purple-500 hover:bg-purple-600"
                : ""
            }
          >
            Active Classes
          </Button>
          <Button
            onClick={() => setFilterStatus("inactive")}
            variant={filterStatus === "inactive" ? "default" : "outline"}
            className={
              filterStatus === "inactive"
                ? "bg-purple-500 hover:bg-purple-600"
                : ""
            }
          >
            Inactive Classes
          </Button>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search classes..."
            className="w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((classItem) => (
          <ClassCard key={classItem.id} classInfo={classItem} />
        ))}
      </div>

      {/* Empty state */}
      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-700">
            No classes found
          </h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </Layout>
  );
}
