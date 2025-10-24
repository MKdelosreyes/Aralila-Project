"use client";
import { MoreHorizontal } from "lucide-react";
import ProgressBar from "./progressBar";
import { Book, MessageSquare } from "lucide-react";

// Define available icon types
type IconType = "Book" | "MessageSquare";

// Define the exercise interface
interface Exercise {
  icon: IconType;
  title: string;
  description: string;
  progress: number;
  isNew?: boolean;
}

// Define props interface
interface ExerciseCardProps {
  exercise: Exercise;
}

// Map of icon names to components with proper typing
const iconMap: Record<IconType, React.ReactElement> = {
  Book: <Book className="h-8 w-8 text-purple-500" />,
  MessageSquare: <MessageSquare className="h-8 w-8 text-purple-500" />,
};

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  const icon = iconMap[exercise.icon];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="rounded-full bg-purple-100 p-3">{icon}</div>
          <div className="flex items-center space-x-2">
            {exercise.isNew && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                NEW
              </span>
            )}
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        <h3 className="mt-4 text-lg font-bold">{exercise.title}</h3>
        <p className="text-gray-500 text-sm mt-1">{exercise.description}</p>

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium">{exercise.progress}%</span>
          </div>
          <ProgressBar progress={exercise.progress} />
        </div>

        <button className="mt-4 w-full py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors">
          Continue Learning
        </button>
      </div>
    </div>
  );
}
