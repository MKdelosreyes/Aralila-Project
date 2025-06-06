"use client";

import { ReactNode, useState, useEffect } from "react";
import NavItem from "@/components/ui/navItem";
import Layout from "@/components/layout/layout";
import ClassroomInfoCard from "@/components/ui/classroomInfoCard";
import ProficiencyDistribution from "@/components/ui/proficiencyDistribution";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { classroomAPI } from "@/lib/api/classroom";
import { authAPI } from "@/lib/api/auth";
import {
  Search,
  FileText,
  Filter,
  Eye,
  Copy,
  Calendar,
  Clock,
  MoreHorizontal,
  Beaker,
  Calculator,
  BookOpen,
  User2,
  UserCheck2Icon,
  UserCheckIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import TabNavigation from "@/components/ui/tabNavigation";
import FilterAndCreate from "@/components/ui/filter";
import AssessmentCard from "@/components/ui/assessmentCard";
import Filters from "@/components/ui/filter";
import CustomButton from "@/components/ui/customButtom";

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
    students: 26,
  },
  {
    id: 2,
    title: "Writing Quiz #3",
    subject: "Mathematics",
    type: "Draft",
    description: "Weekly quiz covering writing mechanics and techniques.",
    createdAt: "May 28, 2025",
    dueAt: "May 28, 2025",
    submitted: 32,
    total: 35,
    status: "draft",
    icon: Calculator,
    difficulty: "Hard",
    estimatedTime: "30 min",
    avgScore: 75,
    students: 30,
  },
  {
    id: 3,
    title: "Persuasive Writing",
    subject: "Science",
    type: "Natapos",
    description:
      "Draft a persuasive speech following the learned structure and mechanics of the past lesson.",
    createdAt: "May 25, 2025",
    dueAt: "May 25, 2025",
    submitted: 25,
    total: 30,
    status: "completed",
    icon: Beaker,
    difficulty: "Easy",
    estimatedTime: "60 min",
    avgScore: 88,
    students: 28,
  },
];

const page = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Exercises");
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<User[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const classId = params.id;
  const [searchTerm, setSearchTerm] = useState("");

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

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Sample data
  // const assessments = [
  //   {
  //     id: 1,
  //     title: "Filipino Poetry Analysis",
  //     description:
  //       "Comprehensive assessment covering traditional and modern Filipino poetry forms.",
  //     dueDate: "May 30, 2025",
  //     duration: "2 hours",
  //     students: 28,
  //     subject: "Filipino 101",
  //     status: "active",
  //   },
  //   {
  //     id: 2,
  //     title: "Mathematics Quiz #3",
  //     description:
  //       "Weekly quiz covering algebraic equations and problem solving techniques.",
  //     dueDate: "May 28, 2025",
  //     duration: "45 mins",
  //     students: 32,
  //     subject: "Math 201",
  //     status: "draft",
  //   },
  //   {
  //     id: 3,
  //     title: "Science Lab Report",
  //     description:
  //       "Detailed laboratory report on chemical reactions and observations.",
  //     dueDate: "May 25, 2025",
  //     duration: "3 days",
  //     students: 25,
  //     subject: "Science 301",
  //     status: "completed",
  //   },
  // ];

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active")
      return matchesSearch && assessment.status === "active";
    if (activeTab === "completed")
      return matchesSearch && assessment.status === "completed";

    return matchesSearch;
  });

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
  const sideTabClick = () => {
    console.log("");
  };

  return (
    <Layout sidebar={true} user={user} id={Number(classId)}>
      <div className="rounded-2xl bg-white p-6 h-fit">
        {/* max-w-7xl mx-auto */}
        <div className="">
          {/* <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mga Pagsusulit</h1>
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
          </div> */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mga Pagsusulit
              </h1>
              <p className="text-gray-600 mt-1">
                Pamahalaan at subaybayan ang iyong mga pagtatasa
              </p>
            </div>
            {/* <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
              <Plus className="w-5 h-5" />
              Gumawa ng Gawain
            </button> */}
            <CustomButton text={"Gumawa ng Gawain"} />
          </div>

          {/* <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex items-center justify-between mb-8">
            <Filters sortBy={sortBy} setSortBy={setSortBy} />
          </div> */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex flex-1 gap-4 w-full sm:w-auto justify-end">
              <div className="relative flex-1 sm:flex-initial sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Maghanap ng gawain"
                  className="pl-12 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 bg-white"
                />
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 bg-white">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>

          {/* Assessment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssessments.map((assessment) => (
              <AssessmentCard
                classID={Number(classId)}
                key={assessment.id}
                assessment={assessment}
                Icon={assessment.icon}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredAssessments.length === 0 && (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                Walang nakitang assessment
              </h3>
              <p className="text-gray-400">
                Subukan ang ibang search term o gumawa ng bagong assessment.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default page;
