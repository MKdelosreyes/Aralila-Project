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
  Plus,
} from "lucide-react";
import { student, exercises } from "@/data/mockData";
import Layout from "@/components/layout/layout";
import ClassroomInfoCard from "@/components/ui/classroomInfoCard";
import ProficiencyDistribution from "@/components/ui/proficiencyDistribution";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { classroomAPI } from "@/lib/api/classroom";
import { authAPI } from "@/lib/api/auth";
import Filters from "@/components/ui/filter";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
  "Pangalan ng Mag-aaral",
  "Petsa at Oras ng Pagsumite",
  //   "Oras ng Pagsumite",
  "Katayuan",
  "Iskor",
  "Aksyon",
];

const getProgressColor = (score) => {
  if (score >= 80) return "bg-purple-300";
  if (score >= 20) return "bg-gray-400";
  return "bg-gray-500";
};

const getProgressWidth = (score) => {
  return `${Math.max(score, 10)}%`;
};

export default function StudentDashboard() {
  const [selectedCategory, setSelectedCategory] = useState("All Exercises");
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<User[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const classId = params.id;
  const [sortBy, setSortBy] = useState("date");

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
      <div className="rounded-2xl bg-white p-6 h-fit">
        <div className="flex flex-row justify-between mb-5">
          <div className="flex flex-row justify-start gap-3 items-center">
            <Link href={`/teacher/classroom/${Number(classId)}/activities`}>
              <img
                src="/images/back-arrow.png"
                alt="back-arrow icon"
                className="w-9 h-9 p-2 bg-purple-200 rounded-full hover:bg-purple-300"
              />
            </Link>

            <h2 className="text-3xl font-bold text-purple-700 text-shadow-2xs">
              Gawain: Pagsulat ng Sanaysay
            </h2>
          </div>
          <button className="flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white text-sm px-5 py-2 rounded-md font-semibold transition-colors shadow-lg hover:shadow-xl">
            <Plus className="w-5 h-5" />
            I-edit ang gawain
          </button>
        </div>

        <div className="flex flex-row mb-5 gap-5">
          {/* Left Side - Mga Panuto */}
          <div className="flex-1/2 p-5 bg-purple-50 rounded-lg shadow-xl overflow-hidden border border-purple-200">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-purple-950 border-b border-gray-200 pb-2">
                Mga Panuto
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-sm leading-relaxed">
                  Gumawa ng isang sanaysay na may 300-500 salita tungkol sa
                  napiling paksa. Siguraduhing malinaw at organisado ang inyong
                  mga ideya.
                </p>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2 text-sm">
                    Mga Hakbang:
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Pumili ng paksa na interesante sa inyo</li>
                    <li>Mag-research tungkol sa napiling paksa</li>
                    <li>Gumawa ng outline para sa sanaysay</li>
                    <li>Isulat ang buong sanaysay</li>
                    <li>I-review at i-edit ang inyong gawa</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2 text-sm">
                    Mga Kailangan:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Minimum 300 salita, maximum 500 salita</li>
                    <li>May simula, gitna, at wakas</li>
                    <li>Gumamit ng wastong gramatika</li>
                    <li>May bibliograpiya kung may ginamit na sanggunian</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                  <p className="text-blue-800 text-sm">
                    <strong>Deadline:</strong> Hunyo 15, 2025 - 11:59 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Layunin (Rubrics) */}
          <div className="flex-1/2 p-5 bg-white rounded-lg shadow-xl overflow-hidden border border-purple-200">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Layunin at Rubrics
              </h2>

              <div className="space-y-4">
                {/* Learning Objectives */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 text-sm">
                    Mga Layunin sa Pagkatuto:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Makasusulat ng organisadong sanaysay</li>
                    <li>Magagamit ang wastong gramatika at pagkakabaybay</li>
                    <li>Makakapagbahagi ng mga ideya nang malinaw</li>
                    <li>Makapag-aanalisa ng mga paksa nang malalim</li>
                  </ul>
                </div>

                {/* Rubrics Table */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 text-sm">
                    Rubrics sa Pagmamarka:
                  </h4>
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs">
                            Pamantayan
                          </th>
                          <th className="px-3 py-2 text-center font-medium text-gray-700 text-xs">
                            Puntos
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-3 py-2 text-gray-700 text-xs">
                            Nilalaman at Ideya
                          </td>
                          <td className="px-3 py-2 text-center font-medium text-xs">
                            30
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-3 py-2 text-gray-700 text-xs">
                            Organisasyon
                          </td>
                          <td className="px-3 py-2 text-center font-medium text-xs">
                            25
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-gray-700 text-xs">
                            Gramatika at Pagkakabaybay
                          </td>
                          <td className="px-3 py-2 text-center font-medium text-xs">
                            25
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-3 py-2 text-gray-700 text-xs">
                            Creativity at Orihinalidad
                          </td>
                          <td className="px-3 py-2 text-center font-medium text-xs">
                            20
                          </td>
                        </tr>
                        <tr className="bg-purple-50 font-medium">
                          <td className="px-3 py-2 text-purple-800 text-xs">
                            Kabuuang Puntos
                          </td>
                          <td className="px-3 py-2 text-center text-purple-800 text-xs">
                            100
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Grade Scale */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h5 className="font-medium text-green-800 mb-2 text-sm">
                    Sukatan ng Grado:
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                    <div>90-100: Napakahusay</div>
                    <div>80-89: Mahusay</div>
                    <div>70-79: Katamtaman</div>
                    <div>60-69: Kailangan ng Tulong</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between mb-4 border sm:flex-row bg-gray-50 p-3 rounded-lg border-gray-200">
          <h2 className="text-lg font-medium">Mga Isinumiteng Gawain</h2>
          <Filters sortBy={sortBy} setSortBy={setSortBy} />
        </div>
        <div className="flex bg-white rounded-lg border items-center justify-center">
          {students?.length === 0 ? (
            <span className="m-10 text-black text-center">
              No Students Listed
            </span>
          ) : (
            <div className="w-full p-4">
              {/* Header */}
              <div className="grid grid-cols-5 gap-4 mb-6 text-sm font-medium text-gray-600">
                {categories.map((category, index) => (
                  <div key={index} className="text-center">
                    {category}
                  </div>
                ))}
              </div>

              {/* Students List */}
              <div className="space-y-2">
                {students?.map((student) => (
                  <div
                    key={student.id}
                    className="border border-purple-300 rounded-2xl p-2 bg-gray-50"
                  >
                    <div className="grid grid-cols-5 gap-4 items-center">
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
                        <div className="text-sm font-medium text-gray-600">
                          25/04/2025 - 12:30:54
                        </div>
                      </div>

                      {/* Pag-usad with percentage */}
                      <div className="flex items-center justify-center">
                        <div className="relative flex items-center justify-center">
                          <div className="px-4 py-1 bg-red-100 text-red-800 rounded-full font-medium text-sm">
                            Huli ang Pagsumite
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex-1 relative">
                          <div className="w-full bg-gray-200 rounded h-2"></div>
                          <div
                            className="bg-purple-400 h-2 rounded absolute top-0 left-0"
                            style={{ width: `80%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="relative flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full hover:bg-purple-200"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </Button>
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
