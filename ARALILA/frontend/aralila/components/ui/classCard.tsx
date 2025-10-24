"use client";

import { useState } from "react";
import { Users, BookOpen } from "lucide-react";
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
import { useRouter } from "next/navigation";

interface ClassInfo {
  id: string;
  class_name: string;
  section: string;
  icon: "Users" | "BookOpen";
  isActive: boolean;
  totalStudents: number;
}

interface ClassCardProps {
  classInfo: ClassInfo;
}

export function ClassCard({ classInfo }: ClassCardProps) {
  // const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    // if (classInfo.id) {
    //   classroomAPI.getClassroomById(classInfo.id).then(setClassroom);
    // }
    router.push(`/teacher/classroom/${classInfo.id}/dashboard`);
  };

  // const toggleExpanded = () => {
  //   setExpanded(!expanded);
  // };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow gap-4">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-purple-100 p-3">
              {classInfo.icon === "Users" ? (
                <Users className="h-6 w-6 text-purple-500" />
              ) : (
                <BookOpen className="h-6 w-6 text-purple-500" />
              )}
            </div>
            <div className="flex flex-col m-0">
              <CardTitle className="text-lg">{classInfo.class_name}</CardTitle>
              <CardDescription>
                {"Section " + classInfo.section}
              </CardDescription>
            </div>
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
            {/* <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button> */}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Class Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {classInfo.totalStudents} students enrolled
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col pt-0">
        <div className="flex w-full gap-2">
          {/* <Link href={`/teacher/classroom/${classInfo.id}`}> */}
          <Button
            onClick={handleClick}
            className="flex-1 bg-white border text-black hover:bg-purple-600 hover:text-white active:bg-gray-600"
          >
            Class Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
