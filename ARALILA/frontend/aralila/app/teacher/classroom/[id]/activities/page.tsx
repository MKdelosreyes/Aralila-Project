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
import AssignmentCreationModal from "@/components/layout/assignmentCreationModal";

const page = () => {
  const [assessments, setAssessments] = useState([
    {
      id: 1,
      title: "Filipino Poetry Analysis",
      type: "Spelling Challenge",
      description:
        "Comprehensive assessment covering traditional and modern Filipino poetry forms.",
      createdAt: "May 30, 2025",
      dueAt: "May 30, 2025",
      total: 35,
      status: "Aktibo",
    },
    {
      id: 2,
      title: "Punctuation Mastery Quiz",
      type: "Punctuation Task",
      description: "Weekly quiz covering writing mechanics and techniques.",
      createdAt: "May 28, 2025",
      dueAt: "May 28, 2025",
      total: 35,
      status: "Tapos na",
    },
    {
      id: 3,
      title: "Persuasive Writing",
      type: "Word Association",
      description:
        "Draft a persuasive speech following the learned structure and mechanics of the past lesson.",
      createdAt: "May 25, 2025",
      dueAt: "May 25, 2025",
      total: 30,
      status: "Aktibo",
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState("All Exercises");
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<User[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const classId = params.id;
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active")
      return matchesSearch && assessment.status === "Aktibo";
    if (activeTab === "completed")
      return matchesSearch && assessment.status === "Tapos na";

    return matchesSearch;
  });

  const handleCreateAssignment = (formData) => {
    const newAssignment = {
      id: formData.length + 1,
      title: formData.title,
      subject: "Filipino",
      type: "Aktibo",
      description: formData.description,
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
    };
    setAssessments((prev) => [...prev, newAssignment]);
    setIsModalOpen(false);
  };

  const handleSaveDraft = (formData) => {
    const newAssignment = {
      id: formData.length + 1,
      title: formData.title,
      subject: "Filipino",
      type: "Aktibo",
      description: formData.description,
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
    };
    setAssessments((prev) => [...prev, newAssignment]);
    setIsModalOpen(false);
  };

  return (
    <>
      <Layout sidebar={true} user={user} id={Number(classId)}>
        <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 px-8 py-6 h-fit shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-purple-800 flex items-center gap-2">
                Mga Laro ng Pagsusulit
              </h1>
              <p className="text-gray-700 mt-2 text-lg">
                Pamahalaan at subaybayan ang iyong mga pagsusulit gamit ang mga
                interactive na laro.
              </p>
            </div>
            <CustomButton
              onClick={() => setIsModalOpen(true)}
              text="Gumawa ng Laro"
              // className="bg-purple-600 text-white hover:bg-purple-700"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-purple-200 mb-6 shadow">
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex flex-1 gap-4 w-full sm:w-auto justify-end">
              <div className="relative flex-1 sm:flex-initial sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Hanapin ang laro..."
                  className="pl-12 pr-4 py-2 w-full border border-purple-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 bg-purple-50"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="px-4 py-2 border border-purple-300 rounded-lg hover:bg-purple-100 flex items-center gap-2 bg-white text-purple-700 font-semibold">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="relative bg-white rounded-3xl border border-purple-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
              >
                {/* Card Content */}
                <div className="p-7 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-transparent rounded-2xl flex items-center justify-center text-purple-600 shadow-lg">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-extrabold text-purple-800 mb-1 leading-tight group-hover:underline transition">
                        {assessment.title}
                      </h3>

                      {/* Status Badge */}
                      <div className="">
                        <span className="inline-block bg-gradient-to-r from-purple-500 to-indigo-400 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md tracking-wider uppercase">
                          {assessment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    {assessment.description}
                  </p>

                  {/* Game Stats */}
                  <div className="flex flex-wrap gap-2 my-4">
                    <div className="inline-flex items-center px-3 py-1.5 bg-purple-50 rounded-lg text-xs text-purple-700 font-medium shadow-sm">
                      <svg
                        className="w-4 h-4 mr-1.5 opacity-70"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {assessment.type}
                    </div>
                  </div>

                  {/* Game Meta */}
                  <div className="flex items-center justify-between mb-6 text-xs text-slate-500 font-semibold">
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        />
                      </svg>
                      Nakatakda: {assessment.createdAt}
                    </div>
                    <div className="flex items-center bg-gradient-to-r from-white to-indigo-100 border-purple-600 border-1 text-purple-600 px-3 py-1 rounded-lg font-semibold">
                      <svg
                        className="w-4 h-4 mr-1.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" />
                      </svg>
                      {/* {game.contentCount} */}12 na mga aytem
                    </div>
                  </div>

                  {/* Edit Button */}
                  <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 hover:shadow-lg">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <span>I-edit ang Laro</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredAssessments.length === 0 && (
            <div className="text-center py-20">
              <FileText className="w-20 h-20 text-purple-200 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-purple-500 mb-3">
                Walang nakitang laro
              </h3>
              <p className="text-purple-400">
                Subukan ang ibang search term o gumawa ng bagong laro ng
                pagsusulit.
              </p>
            </div>
          )}
        </div>
      </Layout>

      {/* 🛠️ Drawer OUTSIDE the Layout */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 top-15 left-20 z-40 bg-black/20 backdrop-blur-sm pointer-events-none" />
          <div className="fixed top-0 right-0 z-50 mt-18 mb-8 mr-3 w-full max-w-xl bg-white rounded-lg shadow-2xl border-l border-purple-100 transition-transform duration-300 animate-slide-in">
            <AssignmentCreationModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onCreateAssignment={handleCreateAssignment}
              asDrawer
            />
          </div>
        </>
      )}
    </>
  );
};

export default page;
