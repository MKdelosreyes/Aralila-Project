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
  Trophy,
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
// import "../../../../../styles/colors.css";

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
  "Pagbuo ng Pangungusap",
];

const getRankIcon = (rank) => {
  if (rank === 1) return "🏆";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return rank;
};

const getProgressBarColor = (progress) => {
  if (progress >= 90) return "bg-green-500";
  if (progress >= 75) return "bg-blue-500";
  if (progress >= 60) return "bg-yellow-500";
  return "bg-red-500";
};

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
      <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 p-6 h-fit shadow-lg">
        <div className="flex flex-row mb-5 gap-5">
          {/* {classroom?.class_name} */}
          <ClassroomInfoCard
            classInfo={classroom}
            studentSize={students?.length}
          />
          <ProficiencyDistribution />
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {students?.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <span className="text-gray-500 text-lg">
                  No Students Listed
                </span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-4 px-6 py-4 text-sm font-semibold">
                  {categories.map((category, index) => (
                    <div
                      key={index}
                      className="text-center flex items-center justify-center"
                    >
                      <span className="truncate">{category}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {classroom?.students?.map((student, index) => (
                  <div
                    key={student.id}
                    className={`grid grid-cols-[80px_repeat(7,1fr)] px-6 gap-4 py-4 hover:bg-purple-25 transition-colors duration-200 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold text-lg">
                        {getRankIcon(student?.rank)}
                      </div>
                    </div>

                    {/* Student Name & Avatar */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-lg font-semibold shadow-md border-3 border-purple-400">
                        {/* {student?.user.profile_pic} */}
                        <Image
                          src={student?.profile_pic}
                          alt={`user-${student?.id}-icon`}
                          width={160}
                          height={40}
                          priority
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {`${student?.full_name}`}
                        </div>
                      </div>
                    </div>

                    {/* Kabuuang Iskor */}
                    <div className="flex items-center justify-center">
                      <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">
                        {student?.overall_score}
                      </div>
                    </div>

                    {/* Pag-usad with progress bar */}
                    <div className="flex items-center justify-center">
                      <div className="w-full max-w-20">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressBarColor(
                                student.progress
                              )} transition-all duration-300`}
                              style={{ width: `${student.progress}` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-gray-700 min-w-fit">
                            {student.progress}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mekaniks ng Pagsulat */}
                    <div className="flex items-center justify-center">
                      <div className="text-sm font-medium text-gray-800 bg-blue-50 px-2 py-1 rounded">
                        {student.Mechanics}
                      </div>
                    </div>

                    {/* Bokabularyo */}
                    <div className="flex items-center justify-center">
                      <div className="text-sm font-medium text-gray-800 bg-green-50 px-2 py-1 rounded">
                        {student.Vocabulary}
                      </div>
                    </div>

                    {/* Gramatika sa Pagsulat */}
                    <div className="flex items-center justify-center">
                      <div className="text-sm font-medium text-gray-800 bg-yellow-50 px-2 py-1 rounded">
                        {student.Grammar}
                      </div>
                    </div>

                    {/* Kayarian ng Pangungusap */}
                    <div className="flex items-center justify-center">
                      <div className="text-sm font-medium text-gray-800 bg-purple-50 px-2 py-1 rounded">
                        {student.Sentence_Construction}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Footer */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {students?.length} student
                    {students?.length !== 1 ? "s" : ""}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Trophy className="h-4 w-4 text-purple-600" />
                    <span>Performance Overview</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
