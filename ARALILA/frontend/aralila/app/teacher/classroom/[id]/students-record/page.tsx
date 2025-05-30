"use client";

import Image from "next/image";
import React, { ReactNode, useState, useEffect } from "react";
import {
  Users,
  Download,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  Settings,
} from "lucide-react";
import { student, exercises } from "@/data/mockData";
import ExerciseCard from "@/components/ui/exerciseCard";
import NavItem from "@/components/ui/navItem";
import Layout from "@/components/layout/layout";
import ClassroomInfoCard from "@/components/ui/classroomInfoCard";
import CategoryFilter from "@/components/ui/categoryFilter";
import ProficiencyDistribution from "@/components/ui/proficiencyDistribution";
import { useParams } from "next/navigation";
import { classroomAPI } from "@/lib/api/classroom";
import { authAPI } from "@/lib/api/auth";

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
  teacher: User;
  class_name: string;
  section: string;
  isActive: boolean;
  subject: string;
  semester: string;
  class_key: string;
  created_at: Date;
  students: ReactNode[];
}

export default function StudentDashboard() {
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  // const [students, setStudents] = useState<User[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const classId = params.id;
  const [activeTab, setActiveTab] = useState("students");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (classId && !isNaN(Number(classId))) {
      classroomAPI.getClassroomById(Number(classId)).then(setClassroom);
      // classroomAPI.getClassroomStudentList(Number(classId)).then((data) => {
      //   console.log("Fetched students:", data);
      //   setStudents(data);
      // });
    }

    const loadData = async () => {
      try {
        const userData = await authAPI.getProfile();
        // console.log(
        //   "Retrieved user profile successfully..." + students?.length
        // );
        setUser(userData);
      } catch (err) {
        console.log(error);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [classId]);

  const students = [
    {
      id: 1,
      name: "Yana Paragoso",
      email: "yana.paragoso@cit.edu",
      studentId: "123-453-41",
      joined: "5/28/2025",
      progress: 85,
      lastActive: "5/21/2025",
      avatar: "KC",
    },
    {
      id: 2,
      name: "Fiel Louis Omas-as",
      email: "fiellouis.omasas@gmail.com",
      studentId: "123-456-789",
      joined: "5/28/2025",
      progress: 93,
      lastActive: "5/20/2025",
      avatar: "KC",
    },
    {
      id: 3,
      name: "Mary Karylle",
      email: "marykarylle.delosreyes@cit.edu",
      studentId: "22-1414-234",
      joined: "5/28/2025",
      progress: 30,
      lastActive: "5/28/2025",
      avatar: "MK",
    },
    // {
    //   id: 4,
    //   name: "Dechie Sullano",
    //   email: "dechie.sullano@cit.edu",
    //   studentId: "22-4582-314",
    //   joined: "5/28/2025",
    //   progress: 35,
    //   lastActive: "5/29/2025",
    //   avatar: "DS",
    // },
  ];

  const pendingRequests = [
    {
      id: 1,
      name: "Juan Dela Cruz",
      email: "juan.delacruz@cit.edu",
      studentId: "21-1234-567",
      requestDate: "5/29/2025",
      requestTime: "10:30 AM",
      reason: "Late enrollment",
      avatar: "JD",
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria.santos@cit.edu",
      studentId: "21-7890-123",
      requestDate: "5/29/2025",
      requestTime: "2:15 PM",
      reason: "Transfer from another section",
      avatar: "MS",
    },
  ];

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-300";
    if (progress >= 60) return "bg-yellow-300";
    return "bg-red-300";
  };

  const getProgressBgColor = (progress) => {
    if (progress >= 80) return "bg-green-100";
    if (progress >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const handleApproveRequest = (id) => {
    console.log("Approved request:", id);
  };

  const handleRejectRequest = (id) => {
    console.log("Rejected request:", id);
  };

  const renderHeader = () => {
    if (activeTab === "students") {
      return (
        <div className="bg-gradient-to-r from-purple-100 to-purple-400 text-purple-950 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-purple-300 rounded-full transition-colors">
                {/* <ArrowLeft className="w-6 h-6" /> */}
                <img src="/images/back-arrow.png" alt="" className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Student List</h1>
                <p className="text-purple-950">
                  Class: CS-123 • Section: F2 • Code: ONFQHZ
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-gradient-to-r from-purple-100 to-purple-400 text-purple-950 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-purple-300 rounded-full transition-colors">
                {/* <ArrowLeft className="w-6 h-6" /> */}
                <img src="/images/back-arrow.png" alt="" className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Pending Requests</h1>
                <p className="text-purple-950">
                  Student requests waiting for your approval
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderStudentListContent = () => (
    <div className="p-6">
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 flex items-center justify-between space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search students by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-row gap-3">
            <div className="bg-purple-600 px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <button className="flex items-center space-x-2 text-white hover:text-purple-200 font-medium">
                <Download className="w-5 h-5" />
                <span>Export Student List</span>
              </button>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-y-auto">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600 text-sm">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                  >
                    <span>STUDENT</span>
                    {getSortIcon("name")}
                  </button>
                </th>
                <th className="text-left p-4 font-medium text-gray-600 text-sm">
                  <button
                    onClick={() => handleSort("email")}
                    className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                  >
                    <span>EMAIL</span>
                    {getSortIcon("email")}
                  </button>
                </th>
                <th className="text-left p-4 font-medium text-gray-600 text-sm">
                  <span>STUDENT ID#</span>
                </th>
                <th className="text-left p-4 font-medium text-gray-600 text-sm">
                  <button
                    onClick={() => handleSort("joined")}
                    className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                  >
                    <span>JOINED</span>
                    {getSortIcon("joined")}
                  </button>
                </th>
                <th className="text-left p-4 font-medium text-gray-600 text-sm">
                  <button
                    onClick={() => handleSort("progress")}
                    className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                  >
                    <span>PROGRESS</span>
                    {getSortIcon("progress")}
                  </button>
                </th>
                <th className="text-left p-4 font-medium text-gray-600 text-sm">
                  <span>LAST ACTIVE</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr
                  key={student.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index === students.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {student.avatar}
                      </div>
                      <span className="font-medium text-gray-900">
                        {student.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{student.email}</td>
                  <td className="p-4 text-gray-600">{student.studentId}</td>
                  <td className="p-4 text-gray-600">{student.joined}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900">
                        {student.progress}%
                      </span>
                      <div
                        className={`w-16 h-2 rounded-full ${getProgressBgColor(
                          student.progress
                        )}`}
                      >
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                            student.progress
                          )}`}
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{student.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {students.length} of {students.length} students
          </span>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 text-sm bg-purple-600 text-white rounded">
              1
            </button>
            <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPendingRequestsContent = () => (
    <div className="p-6">
      {/* Pending Requests Table or Empty State */}
      {pendingRequests.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600 text-sm">
                    STUDENT
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600 text-sm">
                    EMAIL
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600 text-sm">
                    STUDENT ID#
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600 text-sm">
                    REQUEST DATE
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600 text-sm">
                    REASON
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600 text-sm">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((request, index) => (
                  <tr
                    key={request.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index === pendingRequests.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {request.avatar}
                        </div>
                        <span className="font-medium text-gray-900">
                          {request.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{request.email}</td>
                    <td className="p-4 text-gray-600">{request.studentId}</td>
                    <td className="p-4 text-gray-600">
                      <div>
                        <div>{request.requestDate}</div>
                        <div className="text-sm text-gray-500">
                          {request.requestTime}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{request.reason}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleApproveRequest(request.id)}
                          className="flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200 transition-colors text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="flex items-center space-x-1 bg-red-100 text-red-700 px-3 py-1 rounded-md hover:bg-red-200 transition-colors text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No pending join requests
            </h3>
            <p className="text-gray-600 mb-4">
              You're all caught up! There are no pending join requests at this
              time.
            </p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Layout sidebar={true} user={user}>
      <div className="rounded-2xl bg-gray-50">
        {/* Dynamic Header */}
        {renderHeader()}

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-center">
            <nav className="flex flex-row items-center justify-between w-full">
              <button
                onClick={() => setActiveTab("students")}
                className={`flex-1/2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "students"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Student List ({students.length})
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`flex-1/2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "requests"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Join Requests ({pendingRequests.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Dynamic Content */}
        {activeTab === "students"
          ? renderStudentListContent()
          : renderPendingRequestsContent()}
      </div>
    </Layout>
  );
}
