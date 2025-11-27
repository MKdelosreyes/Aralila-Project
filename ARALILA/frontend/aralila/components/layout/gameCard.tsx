"use client";
import React from "react";
import {
  MoreHorizontal,
  Edit3,
  Copy,
  BarChart3,
  Trash2,
  Users,
  Trophy,
  Clock,
  Play,
  PenTool,
  CheckCircle2,
  Target,
  Link,
  Shuffle,
  MessageCircle,
  Zap,
  Gamepad2,
} from "lucide-react";
import CustomButton2 from "../ui/customButton2";
import { useState } from "react";

const gameIcons = {
  "Spelling Challenge": PenTool,
  "Punctuation Task": CheckCircle2,
  "Parts of Speech": Target,
  "Word Association": Link,
  "Word Matching": Shuffle,
  "Grammar Check": Edit3,
  "Sentence Construction": MessageCircle,
  "Emoji Sentence": Zap,
};

interface GameCardProps {
  game: {
    type: keyof typeof gameIcons; // This ensures type matches available icons
    title: string;
    gradient: string;
    status: "Aktibo" | "Nakatigil" | "Draft";
    participants: number;
    avgScore: number;
    duration: string;
    topStudents: string[];
  };
  classID: string;
}

const GameCard: React.FC<GameCardProps> = ({ game, classID }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const GameIcon = gameIcons[game.type] || Gamepad2;

  const statusColors = {
    Aktibo: "bg-green-100 text-green-800 border-green-200",
    Nakatigil: "bg-red-100 text-red-800 border-red-200",
    Draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${game.gradient}`}>
            <GameIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {game.title}
            </h3>
            <p className="text-sm text-gray-500">{game.type}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-10">
              <div className="p-1">
                <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  I-edit
                </button>
                <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Kopyahin
                </button>
                <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Tingnan Results
                </button>
                <hr className="my-1" />
                <button className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Tanggalin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
            statusColors[game.status]
          }`}
        >
          {game.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {game.participants}
          </p>
          <p className="text-xs text-gray-500">Participants</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <Trophy className="w-4 h-4" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {game.avgScore}%
          </p>
          <p className="text-xs text-gray-500">Avg Score</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-lg font-semibold text-gray-900">{game.duration}</p>
          <p className="text-xs text-gray-500">Duration</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {game.topStudents.map((student, index) => (
              <div
                key={index}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white flex items-center justify-center"
              >
                <span className="text-xs font-medium text-white">
                  {student}
                </span>
              </div>
            ))}
          </div>
          <span className="text-xs text-gray-500">Top performers</span>
        </div>
        <CustomButton2
          text="Simulan"
          icon={Play}
          size="sm"
          variant="success"
          onClick={() => console.log("Start game")}
        />
      </div>
    </div>
  );
};

export default GameCard;
