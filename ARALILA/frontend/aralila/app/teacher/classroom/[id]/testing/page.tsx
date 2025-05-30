"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Calendar,
  Users,
  Clock,
  BookOpen,
  Calculator,
  Beaker,
  Eye,
  Copy,
  MoreHorizontal,
  Plus,
  Grid3X3,
  List,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const AssessmentDashboard = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const assessments = [
    {
      id: 1,
      title: "Filipino Poetry Analysis",
      subject: "Filipino",
      type: "Aktibo",
      description:
        "Comprehensive assessment covering traditional and modern Filipino poetry forms.",
      createdAt: "May 30, 2025",
      dueAt: "May 30, 2025",
      submitted: 28,
      total: 35,
      status: "active",
      icon: BookOpen,
      difficulty: "Medium",
      estimatedTime: "45 min",
      avgScore: 82,
    },
    {
      id: 2,
      title: "Mathematics Quiz #3",
      subject: "Mathematics",
      type: "Draft",
      description:
        "Weekly quiz covering algebraic equations and problem solving techniques.",
      createdAt: "May 28, 2025",
      dueAt: "May 28, 2025",
      submitted: 32,
      total: 35,
      status: "draft",
      icon: Calculator,
      difficulty: "Hard",
      estimatedTime: "30 min",
      avgScore: 75,
    },
    {
      id: 3,
      title: "Science Lab Report",
      subject: "Science",
      type: "Natapos",
      description:
        "Detailed laboratory report on chemical reactions and observations.",
      createdAt: "May 25, 2025",
      dueAt: "May 25, 2025",
      submitted: 25,
      total: 30,
      status: "completed",
      icon: Beaker,
      difficulty: "Easy",
      estimatedTime: "60 min",
      avgScore: 88,
    },
  ];

  const stats = [
    { label: "Total Assessments", value: "12", change: "+2", icon: BookOpen },
    { label: "Active", value: "4", change: "+1", icon: CheckCircle2 },
    { label: "Avg. Completion", value: "89%", change: "+5%", icon: TrendingUp },
    { label: "Overdue", value: "1", change: "-2", icon: AlertCircle },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600";
      case "Medium":
        return "text-yellow-600";
      case "Hard":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mga Pagsusulit
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track your assessments
              </p>
            </div>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
              <Plus className="w-5 h-5" />
              Gumawa ng Gawain
            </button>
          </div>

          {/* Stats Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-600">
                      {stat.change} from last week
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <stat.icon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            ))}
          </div> */}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex flex-1 gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ayusin ayon sa petsa"
                  className="pl-12 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">All Subjects</option>
                <option value="filipino">Filipino</option>
                <option value="math">Mathematics</option>
                <option value="science">Science</option>
              </select>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${
                  viewMode === "grid"
                    ? "bg-purple-100 text-purple-600"
                    : "text-gray-400"
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${
                  viewMode === "list"
                    ? "bg-purple-100 text-purple-600"
                    : "text-gray-400"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Assessments Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((assessment) => {
              const Icon = assessment.icon;
              const submissionRate = Math.round(
                (assessment.submitted / assessment.total) * 100
              );

              return (
                <div
                  key={assessment.id}
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Icon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <span
                            className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                              assessment.status
                            )}`}
                          >
                            {assessment.type}
                          </span>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {assessment.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {assessment.description}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {assessment.submitted}/{assessment.total} (
                          {submissionRate}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(
                            submissionRate
                          )}`}
                          style={{ width: `${submissionRate}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{assessment.estimatedTime}</span>
                        </div>
                        <div
                          className={`font-medium ${getDifficultyColor(
                            assessment.difficulty
                          )}`}
                        >
                          {assessment.difficulty}
                        </div>
                      </div>
                      <div className="text-right">
                        <div>Avg: {assessment.avgScore}%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {assessment.dueAt}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Assessment
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Subject
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Progress
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Due Date
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Avg Score
                    </th>
                    <th className="text-right py-4 px-6 font-medium text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assessments.map((assessment) => {
                    const Icon = assessment.icon;
                    const submissionRate = Math.round(
                      (assessment.submitted / assessment.total) * 100
                    );

                    return (
                      <tr key={assessment.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Icon className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {assessment.title}
                              </div>
                              <div className="text-sm text-gray-600">
                                {assessment.estimatedTime} •{" "}
                                {assessment.difficulty}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-900">
                          {assessment.subject}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                              assessment.status
                            )}`}
                          >
                            {assessment.type}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-24">
                              <div
                                className={`h-2 rounded-full ${getProgressColor(
                                  submissionRate
                                )}`}
                                style={{ width: `${submissionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {submissionRate}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-900">
                          {assessment.dueAt}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-gray-900">
                            {assessment.avgScore}%
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentDashboard;
