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
  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-purple-700">
            Pagsulat ng Sanaysay
          </h1>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <span className="text-lg">+</span>
            I-edit ang gawain
          </button>
        </div>

        {/* Main Activity Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Mga Panuto */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
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
                    <li>May bibliografia kung may ginamit na sanggunian</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                  <p className="text-blue-800 text-sm">
                    <strong>Deadline:</strong> Hunyo 15, 2025 - 11:59 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Layunin (Rubrics) */}
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

        {/* Student Submissions Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Mga Isinumiteng Gawain
              </h2>
              <button className="text-gray-500 hover:text-gray-700 flex items-center gap-2 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  ></path>
                </svg>
                Ayusin ayon sa petsa
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
              <div className="col-span-3">Pangalan ng Mag-aaral</div>
              <div className="col-span-2">Petsa at Oras ng Pagsumite</div>
              <div className="col-span-2">Kataguan</div>
              <div className="col-span-3">Iskor</div>
              <div className="col-span-2">Aksyon</div>
            </div>
          </div>

          {/* Student Entries */}
          <div className="divide-y divide-gray-200">
            {/* Student 1 */}
            <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-medium text-sm">
                      CG
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">
                    Carrie Gomez
                  </span>
                </div>
                <div className="col-span-2 text-sm text-gray-600">
                  25/04/2025 - 12:30:54
                </div>
                <div className="col-span-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Huli ang Pagsumite
                  </span>
                </div>
                <div className="col-span-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                </div>
                <div className="col-span-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Student 2 */}
            <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      JD
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">
                    Juan Dela Cruz
                  </span>
                </div>
                <div className="col-span-2 text-sm text-gray-600">
                  25/04/2025 - 12:30:54
                </div>
                <div className="col-span-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Huli ang Pagsumite
                  </span>
                </div>
                <div className="col-span-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: "92%" }}
                    ></div>
                  </div>
                </div>
                <div className="col-span-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Student 3 */}
            <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-medium text-sm">
                      MB
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">
                    Mike Busowski
                  </span>
                </div>
                <div className="col-span-2 text-sm text-gray-600">
                  25/04/2025 - 12:30:54
                </div>
                <div className="col-span-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Huli ang Pagsumite
                  </span>
                </div>
                <div className="col-span-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: "78%" }}
                    ></div>
                  </div>
                </div>
                <div className="col-span-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDashboard;
