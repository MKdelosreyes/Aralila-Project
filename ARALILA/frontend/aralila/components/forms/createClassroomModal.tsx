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
import { classroomAPI } from "@/lib/api/classroom";
import { useRouter } from "next/navigation";

export default function CreateClassroomModal({
  onCreate,
}: {
  onCreate: (data: any) => void;
}) {
  const [open, setOpen] = useState(false);
<<<<<<< HEAD
  const [class_name, setName] = useState("");
  const [section, setSection] = useState("");
  const [class_key, setClassKey] = useState(generateClassKey());
=======
  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [classKey, setClassKey] = useState(generateClassKey());
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
  const [teacherID, setTeacherID] = useState("");
  const router = useRouter();

  function generateClassKey() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from(
      { length: 8 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  }

  const handleSubmit = async () => {
<<<<<<< HEAD
    const classroom = { class_name, class_key, section };
    onCreate(classroom);
    setOpen(false);
    // setName("");
    // setSection("");
    // setTeacherID("");
    setClassKey(generateClassKey());

    try {
      const response = await classroomAPI.createClassroom(classroom);
      console.log("Classroom created successfully:", response);
      router.push("/teacher");
    } catch (error: any) {
      console.error(
        "Classroom creation failed:",
        error.response?.data || error.message
      );
    }
=======
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
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
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
<<<<<<< HEAD
              value={class_name}
=======
              value={name}
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
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
<<<<<<< HEAD
                value={class_key}
=======
                value={classKey}
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
<<<<<<< HEAD
                  navigator.clipboard.writeText(class_key);
=======
                  navigator.clipboard.writeText(classKey);
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
<<<<<<< HEAD
          <Button onClick={handleSubmit} disabled={!class_name || !section}>
=======
          <Button onClick={handleSubmit} disabled={!name || !section}>
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
