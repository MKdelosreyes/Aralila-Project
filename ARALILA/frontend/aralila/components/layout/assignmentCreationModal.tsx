// import React, { useState } from "react";
// import { Plus, X, Gamepad2, Clock, BookOpen } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// type Entry = {
//   description: string;
//   question: string;
//   answer: string;
// };

// const Input = ({ className = "", ...props }) => (
//   <input
//     className={`flex h-10 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${className}`}
//     {...props}
//   />
// );

// const Textarea = ({ className = "", ...props }) => (
//   <textarea
//     className={`flex min-h-[80px] w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-200 ${className}`}
//     rows={3}
//     {...props}
//   />
// );

// const Button = ({
//   variant = "primary",
//   children,
//   className = "",
//   ...props
// }) => {
//   const baseClass =
//     "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-6 py-2 gap-2";
//   const variants = {
//     primary:
//       "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl",
//     secondary:
//       "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-input",
//     outline:
//       "border-2 border-purple-200 bg-background text-purple-600 hover:bg-purple-50 hover:border-purple-300",
//   };

//   return (
//     <button
//       className={`${baseClass} ${variants[variant]} ${className}`}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// };

// const AssignmentCreationModal = ({
//   isOpen,
//   onClose,
//   onCreateAssignment,
//   asDrawer,
// }) => {
//   const [_open, setIsOpen] = useState(true);
//   const [gameType, setGameType] = useState("");
//   const [title, setTitle] = useState("");
//   const [instructions, setInstructions] = useState("");
//   const [dueDate, setDueDate] = useState(new Date());
//   const [entries, setEntries] = useState<Entry[]>([]);

//   const gameTypes = [
//     "Spelling Challenge Game",
//     "Punctuation Task",
//     "Grammar Check Game",
//     "Word Matching Activity",
//     "Word Association Game",
//     "Sentence Construction Challenge",
//     "Emoji Sentence Challenge",
//   ];

//   const handleAddEntry = () => {
//     setEntries([...entries, { question: "", answer: "" }]);
//   };

//   const handleEntryChange = (index, field, value) => {
//     const newEntries = [...entries];
//     newEntries[index][field] = value;
//     setEntries(newEntries);
//   };

//   const handleRemoveEntry = (index) => {
//     setEntries(entries.filter((_, i) => i !== index));
//   };

//   const handleCreate = () => {
//     const payload = {
//       gameType,
//       title,
//       instructions,
//       dueDate,
//       entries,
//     };
//     console.log("Submit payload:", payload);
//     setIsOpen(false);
//   };

//   const renderEntryFields = () => {
//     const getPlaceholders = () => {
//       switch (gameType) {
//         case "Spelling Challenge Game":
//         case "Punctuation Task":
//         case "Grammar Check Game":
//           return { question: "Incorrect", answer: "Correct" };
//         case "Word Matching Activity":
//         case "Word Association Game":
//           return { question: "Word", answer: "Match" };
//         case "Sentence Construction Challenge":
//         case "Emoji Sentence Challenge":
//           return { question: "Prompt / Clue", answer: "Expected Answer" };
//         default:
//           return { question: "Question", answer: "Answer" };
//       }
//     };

//     const placeholders = getPlaceholders();
//     const isTextarea = [
//       "Sentence Construction Challenge",
//       "Emoji Sentence Challenge",
//     ].includes(gameType);

//     return entries.map((entry, index) => (
//       <div
//         key={index}
//         className="bg-gray-50/50 border-2 border-gray-100 p-5 rounded-2xl hover:border-purple-200 transition-all duration-200 hover:shadow-sm"
//       >
//         <div className="flex justify-between items-center mb-4">
//           <span className="text-xs font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
//             Item #{index + 1}
//           </span>
//           <button
//             onClick={() => handleRemoveEntry(index)}
//             className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 rounded-md hover:bg-red-50"
//           >
//             <X className="w-4 h-4" />
//           </button>
//         </div>
//         <div className="grid gap-3">
//           {isTextarea ? (
//             <>
//               <Textarea
//                 placeholder={placeholders.question}
//                 value={entry.question}
//                 onChange={(e) =>
//                   handleEntryChange(index, "question", e.target.value)
//                 }
//               />
//               <Textarea
//                 placeholder={placeholders.answer}
//                 value={entry.answer}
//                 onChange={(e) =>
//                   handleEntryChange(index, "answer", e.target.value)
//                 }
//               />
//             </>
//           ) : (
//             <>
//               <Input
//                 placeholder={placeholders.question}
//                 value={entry.question}
//                 onChange={(e) =>
//                   handleEntryChange(index, "question", e.target.value)
//                 }
//               />
//               <Input
//                 placeholder={placeholders.answer}
//                 value={entry.answer}
//                 onChange={(e) =>
//                   handleEntryChange(index, "answer", e.target.value)
//                 }
//               />
//             </>
//           )}
//         </div>
//       </div>
//     ));
//   };

//   if (asDrawer) {
//     return (
//       <div className="flex flex-col max-h-[89vh] min-h-[89vh] rounded-lg">
//         {/* Custom Header with Purple Gradient */}
//         <div className="bg-gradient-to-r from-purple-50 to-indigo-100 px-6 py-5 rounded-t-lg border-b border-purple-100 shadow-sm">
//           <div className="flex items-center gap-3 text-lg font-semibold text-purple-800">
//             <div className="w-10 h-10 bg-purple-100/70 rounded-full flex items-center justify-center shadow">
//               <Gamepad2 className="w-5 h-5 text-purple-600" />
//             </div>
//             <h2 className="text-lg font-semibold text-purple-800 m-0">
//               Gumawa ng Laro
//             </h2>
//           </div>
//         </div>

//         {/* Scrollable Content */}
//         <div className="flex-1 overflow-y-auto py-5 px-10 scrollbar-purple">
//           <div className="space-y-6">
//             {/* Game Type Selection */}
//             <div className="space-y-3">
//               <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
//                 <Gamepad2 className="w-4 h-4 text-purple-600" />
//                 Uri ng Laro
//               </label>
//               <select
//                 value={gameType}
//                 onChange={(e) => {
//                   setGameType(e.target.value);
//                   setEntries([]);
//                 }}
//                 className="flex h-10 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
//               >
//                 <option value="">Pumili ng laro...</option>
//                 {gameTypes.map((game) => (
//                   <option key={game} value={game}>
//                     {game}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Title and Instructions */}
//             <div className="space-y-4">
//               <div className="space-y-3">
//                 <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
//                   <BookOpen className="w-4 h-4 text-purple-600" />
//                   Pamagat ng Aktibidad
//                 </label>
//                 <Input
//                   placeholder="Ilagay ang pamagat..."
//                   value={title}
//                   onChange={(e) => setTitle(e.target.value)}
//                 />
//               </div>

//               <div className="space-y-3">
//                 <label className="text-sm font-semibold text-foreground">
//                   Mga Tagubilin (opsyonal)
//                 </label>
//                 <Textarea
//                   placeholder="Ilagay ang mga tagubilin para sa mga estudyante..."
//                   value={instructions}
//                   onChange={(e) => setInstructions(e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Due Date */}
//             <div className="space-y-3">
//               <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
//                 <Clock className="w-4 h-4 text-purple-600" />
//                 Takdang Petsa
//               </label>
//               <div className="relative">
//                 <input
//                   type="date"
//                   value={dueDate ? dueDate.toISOString().split("T")[0] : ""}
//                   onChange={(e) =>
//                     setDueDate(e.target.value ? new Date(e.target.value) : null)
//                   }
//                   className="flex h-10 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
//                 />
//               </div>
//             </div>

//             {/* Game Content */}
//             {gameType && (
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center">
//                   <h3 className="text-lg font-semibold text-foreground">
//                     Nilalaman ng Laro
//                   </h3>
//                   <Button variant="outline" onClick={handleAddEntry}>
//                     <Plus className="w-4 h-4" />
//                     Magdagdag
//                   </Button>
//                 </div>

//                 <div className="space-y-4 max-h-80 overflow-y-auto">
//                   {entries.length === 0 ? (
//                     <div className="text-center py-5 text-muted-foreground">
//                       <Gamepad2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
//                       <p>
//                         Walang nilalaman pa. Mag-click ng "Magdagdag" para
//                         magsimula.
//                       </p>
//                     </div>
//                   ) : (
//                     renderEntryFields()
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Fixed Footer */}
//         <div className="border-t p-6 rounded-lg">
//           <div className="flex justify-end bg-background gap-3 rounded-lg">
//             <Button variant="secondary" onClick={onClose}>
//               Kanselahin
//             </Button>
//             <button
//               onClick={handleCreate}
//               disabled={!gameType || !title || entries.length === 0}
//               className="min-w-[150px] bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl shadow-lg border border-purple-200 font-semibold tracking-wide text-base flex flex-row justify-center items-center px-4 py-2 gap-2 hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
//             >
//               <Plus className="w-5 h-5" />
//               Gumawa ng Aktibidad
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-lg">
//         {/* Custom Header with Purple Gradient */}
//         <div className="bg-gradient-to-r from-purple-50 to-indigo-100 px-6 py-5 rounded-t-lg border-b border-purple-100 shadow-sm">
//           <DialogHeader className="text-left">
//             <DialogTitle className="flex items-center gap-3 text-lg font-semibold text-purple-800">
//               <div className="w-10 h-10 bg-purple-100/70 rounded-full flex items-center justify-center shadow">
//                 <Gamepad2 className="w-5 h-5 text-purple-600" />
//               </div>
//               Gumawa ng Laro
//             </DialogTitle>
//           </DialogHeader>
//         </div>

//         {/* Scrollable Content */}
//         <div className="flex-1 overflow-y-auto py-5 px-10 scrollbar-purple">
//           <div className="space-y-6">
//             {/* Game Type Selection */}
//             <div className="space-y-3">
//               <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
//                 <Gamepad2 className="w-4 h-4 text-purple-600" />
//                 Uri ng Laro
//               </label>
//               <select
//                 value={gameType}
//                 onChange={(e) => {
//                   setGameType(e.target.value);
//                   setEntries([]);
//                 }}
//                 className="flex h-10 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
//               >
//                 <option value="">Pumili ng laro...</option>
//                 {gameTypes.map((game) => (
//                   <option key={game} value={game}>
//                     {game}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Title and Instructions */}
//             <div className="space-y-4">
//               <div className="space-y-3">
//                 <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
//                   <BookOpen className="w-4 h-4 text-purple-600" />
//                   Pamagat ng Aktibidad
//                 </label>
//                 <Input
//                   placeholder="Ilagay ang pamagat..."
//                   value={title}
//                   onChange={(e) => setTitle(e.target.value)}
//                 />
//               </div>

//               <div className="space-y-3">
//                 <label className="text-sm font-semibold text-foreground">
//                   Mga Tagubilin (opsyonal)
//                 </label>
//                 <Textarea
//                   placeholder="Ilagay ang mga tagubilin para sa mga estudyante..."
//                   value={instructions}
//                   onChange={(e) => setInstructions(e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Due Date */}
//             <div className="space-y-3">
//               <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
//                 <Clock className="w-4 h-4 text-purple-600" />
//                 Takdang Petsa
//               </label>
//               <div className="relative">
//                 <input
//                   type="date"
//                   value={dueDate ? dueDate.toISOString().split("T")[0] : ""}
//                   onChange={(e) =>
//                     setDueDate(e.target.value ? new Date(e.target.value) : null)
//                   }
//                   className="flex h-10 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
//                 />
//               </div>
//             </div>

//             {/* Game Content */}
//             {gameType && (
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center">
//                   <h3 className="text-lg font-semibold text-foreground">
//                     Nilalaman ng Laro
//                   </h3>
//                   <Button variant="outline" onClick={handleAddEntry}>
//                     <Plus className="w-4 h-4" />
//                     Magdagdag
//                   </Button>
//                 </div>

//                 <div className="space-y-4 max-h-80 overflow-y-auto">
//                   {entries.length === 0 ? (
//                     <div className="text-center py-12 text-muted-foreground">
//                       <Gamepad2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
//                       <p>
//                         Walang nilalaman pa. Mag-click ng "Magdagdag" para
//                         magsimula.
//                       </p>
//                     </div>
//                   ) : (
//                     renderEntryFields()
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Fixed Footer */}
//         <div className="border-t p-6 rounded-lg">
//           <div className="flex justify-end bg-background gap-3 rounded-lg">
//             <Button variant="secondary" onClick={onClose}>
//               Kanselahin
//             </Button>
//             <button
//               onClick={handleCreate}
//               disabled={!gameType || !title || entries.length === 0}
//               className="min-w-[150px] bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl shadow-lg border border-purple-200 font-semibold tracking-wide text-base flex flex-row justify-center items-center px-4 py-2 gap-2 hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
//             >
//               <Plus className="w-5 h-5" />
//               Gumawa ng Aktibidad
//             </button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default AssignmentCreationModal;
