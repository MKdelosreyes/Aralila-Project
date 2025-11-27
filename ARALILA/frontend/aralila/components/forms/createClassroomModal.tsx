"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateClassroomModal({
  onCreate,
}: {
  onCreate: (data: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [classKey, setClassKey] = useState(generateClassKey());
  const [teacherID, setTeacherID] = useState("");

  function generateClassKey() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from(
      { length: 8 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  }

  const handleSubmit = async () => {
    const classroom = { name, section, teacherID, classKey };
    onCreate(classroom);
    setOpen(false);
    setName("");
    setSection("");
    setTeacherID("");
    setClassKey(generateClassKey());
    // console.log("Form submitted with data:", classroom);
    // try {
    //   const response = await classroomAPI.createClassroom(classroom);
    //   console.log("User registered successfully:", response);
    //   router.push("/teacher");
    // } catch (error) {
    //   console.error("Classroom creation failed:", error);
    // }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full bg-gradient-to-r from-purple-300 to-indigo-500 text-white font-semibold py-3 rounded-xl shadow hover:from-purple-600 hover:to-purple-800 transition">
          + Create New Class
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Classroom</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Class Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., English 10 - Writing"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section">Section</Label>
            <Input
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g., Section A"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="classKey">Class Key</Label>
            <div className="flex gap-2">
              <Input
                id="classKey"
                value={classKey}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(classKey);
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!name || !section}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
