"use client";

import { useState } from "react";
import {
  Users,
  Clock,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function ClassCard({ classInfo }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Calculate completion percentage based on student progress
  const completionPercentage = Math.round(
    (classInfo.studentsCompleted / classInfo.totalStudents) * 100
  );

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="rounded-full bg-purple-100 p-3">
            {classInfo.icon === "Users" ? (
              <Users className="h-8 w-8 text-purple-500" />
            ) : (
              <BookOpen className="h-8 w-8 text-purple-500" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            {classInfo.isActive && (
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-200"
              >
                ACTIVE
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardTitle className="text-lg mt-4">{classInfo.name}</CardTitle>
        <CardDescription>{classInfo.grade}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pb-2">
        {/* Class Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {classInfo.totalStudents} students
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{classInfo.schedule}</span>
          </div>
        </div>

        {/* Class Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Student Completion</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="font-medium mb-2">Recent Activity</h4>
            <div className="space-y-2">
              {classInfo.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-gray-600">{activity.date}</span>
                    <p className="text-gray-800">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <h4 className="font-medium mt-4 mb-2">Upcoming Assignments</h4>
            <div className="space-y-2">
              {classInfo.upcomingAssignments.map((assignment, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-800">{assignment.title}</span>
                  <span className="text-gray-500">{assignment.dueDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col pt-0">
        <Button
          variant="ghost"
          className="w-full justify-center text-sm text-gray-600"
          onClick={toggleExpanded}
        >
          {expanded ? (
            <>
              <span>Show less</span>
              <ChevronUp className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              <span>Show details</span>
              <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>

        {expanded && (
          <div className="flex w-full gap-2 mt-4">
            <Button className="flex-1 bg-purple-500 hover:bg-purple-600">
              Class Details
            </Button>
            {/* <Button
              variant="outline"
              className="flex-1 border-purple-500 text-purple-500 hover:bg-purple-50 hover:text-purple-500"
            >
              Assign Task
            </Button> */}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
