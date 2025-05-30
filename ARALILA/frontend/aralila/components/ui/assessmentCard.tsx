"use client";
import React from "react";
import {
  Icon,
  MoreHorizontal,
  UserCheck2Icon,
  Calendar,
  Eye,
} from "lucide-react";

const AssessmentCard = ({ assessment, Icon }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Aktibo";
      case "draft":
        return "Draft";
      case "completed":
        return "Natapos";
      default:
        return "Hindi alam";
    }
  };

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

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <UserCheck2Icon className="w-4 h-4" />
              <span>{assessment.students} have submitted</span>
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

        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
          <Eye className="w-4 h-4" />
          View Details
        </button>
      </div>
    </div>
  );
};

export default AssessmentCard;
