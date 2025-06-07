"use client";

import Image from "next/image";
import { ReactNode, useState, useEffect } from "react";
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
import { student, exercises } from "@/data/mockData";
import ExerciseCard from "@/components/ui/exerciseCard";
import NavItem from "@/components/ui/navItem";
import Layout from "@/components/layout/layout";
import ClassroomInfoCard from "@/components/ui/classroomInfoCard";
import CategoryFilter from "@/components/ui/categoryFilter";
import ProficiencyDistribution from "@/components/ui/proficiencyDistribution";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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

const categories = [
  "Rank",
  "Pangalan ng Mag-aaral",
  "Kabuuang Iskor",
  "Pag-usad",
  "Mekaniks ng Pagsulat",
  "Bokabularyo",
  "Gramatika sa Pagsulat",
  "Kayarian ng Pangungusap",
];

const getProgressColor = (score) => {
  if (score >= 80) return "bg-purple-300";
  if (score >= 20) return "bg-gray-400";
  return "bg-gray-500";
};

const getProgressWidth = (score) => {
  return `${Math.max(score, 10)}%`;
};

// const getOverallScore = (student) => {
//   student.scores.
// };

export default function StudentDashboard() {
  // const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Exercises");
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<User[] | null>(null);
  // const router = useRouter();
  // const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const classId = params.id;

  useEffect(() => {
    if (classId && !isNaN(Number(classId))) {
      classroomAPI.getClassroomById(Number(classId)).then(setClassroom);
      classroomAPI.getClassroomStudentList(Number(classId)).then((data) => {
        console.log("Fetched students:", data);
        setStudents(data);
      });
    }

    const loadData = async () => {
      try {
        const userData = await authAPI.getProfile();
        console.log(
          "Retrieved user profile successfully..." + students?.length
        );
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

  const filteredExercises =
    selectedCategory === "All Exercises"
      ? exercises
      : exercises.filter((exercise) => exercise.category === selectedCategory);

  return (
    <Layout sidebar={true} user={user} id={Number(classId)}>
      <div className="rounded-2xl bg-white p-6">
        <div className="flex flex-row mb-5 h-48 gap-5">
          {/* {classroom?.class_name} */}
          <ClassroomInfoCard
            classInfo={classroom}
            studentSize={students?.length}
          />
          <ProficiencyDistribution />
        </div>

        <div className="flex bg-white rounded-lg border items-center justify-center">
          {students?.length === 0 ? (
            <span className="m-10 text-black text-center">
              No Students Listed
            </span>
          ) : (
            <div className="w-full p-4 ">
              {/* Header */}
              <div className="grid grid-cols-[80px_repeat(7,1fr)] p-2 items-center justify-center mb-2 py-4 text-sm font-medium text-shadow-2xs text-white bg-purple-500 rounded-t-lg rounded-b-sm">
                {categories.map((category, index) => (
                  <div key={index} className="text-center px-2">
                    {category}
                  </div>
                ))}
              </div>

              {/* Students List */}
              <div className="space-y-2">
                {students?.map((student) => (
                  <div
                    key={student.id}
                    className="border border-purple-200 rounded-sm p-2"
                  >
                    <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-6">
                      <div className="flex items-center justify-center">
                        <img
                          src="/images/first-rank.png"
                          alt="rank-icon"
                          width="20"
                          height="20"
                        />
                      </div>

                      {/* Student Name & Avatar */}
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-lg border-3 border-purple-400">
                          {/* {student?.user.profile_pic} */}
                          <Image
                            src={student?.user.profile_pic}
                            alt={`user-${student?.user?.id}-icon`}
                            width={160}
                            height={40}
                            priority
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {`${student?.user?.first_name} ${student?.user?.last_name}`}
                          </div>
                        </div>
                      </div>

                      {/* Kabuuang Iskor */}
                      <div className="flex items-center justify-center space-x-2">
                        {/* <div className="w-8 h-6 bg-black"></div> */}
                        <div className="text-sm font-medium">
                          {/* {student.scores.kabuhuan} */}45
                        </div>
                      </div>

                      {/* Pag-usad with percentage */}
                      <div className="flex items-center justify-center">
                        <div className="relative flex items-center justify-center">
                          <div
                            className={`rounded-full flex items-center justify-center text-center text-white font-bold ${getProgressColor(
                              90 // student.overallProgress
                            )}`}
                            style={{
                              width: `${Math.max(71 * 0.4, 28)}px`,
                              height: `${Math.max(88 * 0.4, 28)}px`,
                              fontSize: `12px`,
                            }}
                          >
                            {/* {student.overallProgress} */}95
                          </div>
                        </div>
                      </div>

                      {/* Mekaniks ng Pagsulat */}
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 relative">
                          <div className="w-full bg-gray-200 rounded h-2"></div>
                          <div
                            className="bg-purple-400 h-2 rounded absolute top-0 left-0"
                            style={{ width: `80%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Bokabularyo */}
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 relative">
                          <div className="w-full bg-gray-200 rounded h-2"></div>
                          <div
                            className="bg-purple-300 h-2 rounded absolute top-0 left-0"
                            style={{ width: `80%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Gramatika sa Pagsulat */}
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 relative">
                          <div className="w-full bg-gray-200 rounded h-2"></div>
                          <div
                            className="bg-purple-300 h-2 rounded absolute top-0 left-0"
                            style={{ width: `80%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Kayarian ng Pangungusap */}
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 relative">
                          <div className="w-full bg-gray-200 rounded h-2"></div>
                          <div
                            className="bg-purple-300 h-2 rounded absolute top-0 left-0"
                            style={{ width: `80%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
