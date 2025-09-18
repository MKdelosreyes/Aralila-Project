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
  User,
  Mail,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  UserPlus,
  Settings,
  Book,
  Copy,
  RefreshCw,
  Clock,
  AlertCircle,
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
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // const students = [
  //   {
  //     id: 1,
  //     name: "Yana Paragoso",
  //     email: "yana.paragoso@cit.edu",
  //     studentId: "123-453-41",
  //     joined: "5/28/2025",
  //     progress: 85,
  //     lastActive: "5/21/2025",
  //     avatar: "KC",
  //   },
  //   {
  //     id: 2,
  //     name: "Fiel Louis Omas-as",
  //     email: "fiellouis.omasas@gmail.com",
  //     studentId: "123-456-789",
  //     joined: "5/28/2025",
  //     progress: 93,
  //     lastActive: "5/20/2025",
  //     avatar: "KC",
  //   },
  //   {
  //     id: 3,
  //     name: "Mary Karylle",
  //     email: "marykarylle.delosreyes@cit.edu",
  //     studentId: "22-1414-234",
  //     joined: "5/28/2025",
  //     progress: 30,
  //     lastActive: "5/28/2025",
  //     avatar: "MK",
  //   },
  // ];

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getProgressText = (progress) => {
    if (progress >= 80) return "text-green-700";
    if (progress >= 60) return "text-purple-700";
    if (progress >= 40) return "text-orange-700";
    return "text-red-700";
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const renderHeader = () => {
    if (activeTab === "students") {
      return (
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 text-purple-900 px-8 py-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="bg-purple-500 p-3 rounded-xl shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-purple-900 mb-1">
                  Student List
                </h1>
                <div className="flex items-center space-x-4 text-sm text-purple-700">
                  <div className="flex items-center space-x-2">
                    <Book className="w-4 h-4" />
                    <span className="font-medium">
                      Class: {classroom?.class_name}
                    </span>
                  </div>
                  <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                  <span>Section: {classroom?.section}</span>
                  <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    <span>Code: {classroom?.class_key}</span>
                    <button className="text-purple-600 hover:text-purple-800 transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-purple-200">
                <span className="text-sm font-medium text-purple-700">
                  {classroom?.students?.length}
                  {classroom?.students?.length === 1 ? " Student" : " Students"}
                </span>
              </div>
              <div className="bg-green-100 px-4 py-2 rounded-lg border border-green-200">
                <span className="text-sm font-medium text-green-700">
                  {classroom?.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 text-orange-900 px-8 py-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="bg-orange-500 p-3 rounded-xl shadow-md">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-orange-900 mb-1">
                  Pending Requests
                </h1>
                <p className="text-orange-700 text-sm">
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
      <div className=" bg-white p-1 rounded-xl border border-purple-200 mb-6 shadow">
        <div className="p-4 flex items-center justify-between space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Hanapin ayon sa ngalan, email o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-2 w-full border border-purple-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 bg-purple-50"
            />
          </div>
          <div className="flex flex-row gap-3">
            <div className="bg-purple-600 px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <button className="flex items-center space-x-2 text-white hover:text-purple-200 font-medium">
                <Download className="w-5 h-5" />
                <span>Export Student List</span>
              </button>
            </div>
            <button className="px-4 py-2 border border-purple-300 rounded-lg hover:bg-purple-100 flex items-center gap-2 bg-white text-purple-700 font-semibold">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="mx-auto bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-6 font-semibold text-gray-700 text-sm">
                    <button
                      onClick={() => handleSort("name")}
                      className="flex items-center space-x-2 hover:text-purple-600 transition-colors group"
                    >
                      <User className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
                      <span>STUDENT</span>
                      {getSortIcon("name")}
                    </button>
                  </th>
                  <th className="text-left p-6 font-semibold text-gray-700 text-sm">
                    <button
                      onClick={() => handleSort("email")}
                      className="flex items-center space-x-2 hover:text-purple-600 transition-colors group"
                    >
                      <Mail className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
                      <span>EMAIL</span>
                      {getSortIcon("email")}
                    </button>
                  </th>
                  <th className="text-left p-6 font-semibold text-gray-700 text-sm">
                    <button
                      onClick={() => handleSort("joined")}
                      className="flex items-center space-x-2 hover:text-purple-600 transition-colors group"
                    >
                      <Calendar className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
                      <span>JOINED</span>
                      {getSortIcon("joined")}
                    </button>
                  </th>
                  <th className="text-left p-6 font-semibold text-gray-700 text-sm">
                    <button
                      onClick={() => handleSort("progress")}
                      className="flex items-center space-x-2 hover:text-purple-600 transition-colors group"
                    >
                      <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
                      <span>PROGRESS</span>
                      {getSortIcon("progress")}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {classroom?.students?.map((student, index) => (
                  <tr
                    key={student.id}
                    className={`border-b border-gray-100 hover:bg-purple-50 transition-all duration-200 group ${
                      index === classroom.students.length - 1
                        ? "border-b-0"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-purple-400">
                            {student?.profile_pic ? (
                              <img
                                src={student.profile_pic}
                                alt={`${student.full_name} profile`}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span>{getInitials(student.full_name)}</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="font-semibold text-base text-gray-900 group-hover:text-purple-700 transition-colors">
                            {student.full_name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-gray-600 font-medium text-sm">
                        {student.email}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-gray-700 font-medium text-sm">
                        {formatDate(student.date_joined)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.floor(
                          (new Date() - new Date(student.date_joined)) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days ago
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-sm font-bold ${getProgressText(
                                student.progress
                              )}`}
                            >
                              {student.progress}
                            </span>
                          </div>
                          <div
                            className={`w-full h-3 rounded-full ${getProgressBgColor(
                              student.progress
                            )}`}
                          >
                            <div
                              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(
                                student.progress
                              )} shadow-sm`}
                              style={{ width: `${student.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPendingRequestsContent = () => (
    <div className="p-6">
      {pendingRequests.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-6 font-semibold text-gray-700 text-sm">
                    <div className="flex items-center space-x-2">
                      <UserPlus className="w-4 h-4 text-gray-400" />
                      <span>STUDENT</span>
                    </div>
                  </th>
                  <th className="text-left p-6 font-semibold text-gray-700 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>EMAIL</span>
                    </div>
                  </th>
                  <th className="text-left p-6 font-semibold text-gray-700 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>REQUEST DATE</span>
                    </div>
                  </th>
                  <th className="text-left p-6 font-semibold text-gray-700 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>ACTIONS</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((request, index) => (
                  <tr
                    key={request.id}
                    className={`border-b border-gray-100 hover:bg-orange-50 transition-all duration-200 group ${
                      index === pendingRequests.length - 1 ? "border-b-0" : ""
                    } text-black`}
                  >
                    <td className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-orange-400">
                            {getInitials(request.name)}
                          </div>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                            {request.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-gray-600 font-medium">
                        {request.email}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-gray-700 font-medium">
                        {formatDate(request.requestDate)}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleApproveRequest(request.id)}
                          className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl hover:bg-green-200 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md border border-green-200"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-xl hover:bg-red-200 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md border border-red-200"
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <UserPlus className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No pending join requests
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You're all caught up! There are no pending join requests at this
              time. New requests will appear here when students try to join your
              class.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>
              <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-200">
                <span>View Class Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Layout sidebar={true} user={user} id={Number(classId)}>
      <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 h-fit shadow-lg">
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
                Student List ({classroom?.students?.length})
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
