"use client";

import { useState } from "react";
import { Plus, Search, Filter, Menu } from "lucide-react";
// import AssignmentCard from "./AssignmentCard";
// import AssignmentCreationModal from "./AssignmentCreationModal";

const page = () => {
  const [category, setCategory] = useState<"game" | "non-game">("non-game");
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [gradingType, setGradingType] = useState<"points" | "weight">("points");

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Create Assignment</h2>

      {/* Assignment Category */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Assignment Category</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={category}
          onChange={(e) => setCategory(e.target.value as "game" | "non-game")}
        >
          <option value="non-game">Non-Game</option>
          <option value="game">Game</option>
        </select>
      </div>

      {/* Type (based on category) */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Assignment Type</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {category === "non-game" ? (
            <>
              <option value="">-- Select Type --</option>
              <option value="essay">Essay</option>
              <option value="short-answer">Short Answer</option>
              <option value="comic-dialogue">Comic Dialogue</option>
            </>
          ) : (
            <>
              <option value="">-- Select Game --</option>
              <option value="4pics">4 Pics 1 Word</option>
              <option value="sentence-builder">Sentence Builder</option>
              <option value="grammar-fixer">Grammar Fixer</option>
            </>
          )}
        </select>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Assignment Title</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          rows={4}
          placeholder="Enter assignment description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Game Config (only if game type) */}
      {category === "game" && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">Number of Rounds</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. 5"
          />
        </div>
      )}

      {/* Points or Weight */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Total Points</label>

        <div className="mt-2">
          <input
            type="number"
            placeholder="e.g. 100"
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      {/* Rubric Upload/Selection */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Rubric (Optional)</label>
        {/* <div className="flex gap-4">
          <input type="file" className="w-full border rounded px-3 py-2" />
          <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
            Select Preset
          </button>
        </div> */}
        <textarea
          placeholder="Enter grading rubric or evaluation criteria"
          className="w-full border rounded px-3 py-2 h-20 resize-none"
        ></textarea>
      </div>

      {/* Due and Open Date/Time */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-medium">Due Date</label>
          <input type="date" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Due Time</label>
          <input type="time" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Open Date</label>
          <input type="date" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Close Time</label>
          <input type="time" className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button className="px-4 py-2 rounded bg-gray-300 text-black hover:bg-gray-400">
          Cancel
        </button>
        <button className="px-4 py-2 rounded bg-indigo-500 text-white hover:bg-indigo-600">
          Save as Draft
        </button>
        <button className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700">
          Create Assignment
        </button>
      </div>
    </div>
  );
};

export default page;
