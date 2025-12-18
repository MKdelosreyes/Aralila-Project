import SidebarIcon from "./sidebar-icon";
import { Home, Swords, Settings, Play, BookOpen, ChartBar } from "lucide-react";

const sidebarItems = [
  { icon: Home, text: "Home", href: "/student/dashboard" },
  // { icon: BookOpen, text: "Classroom", href: "/student/classroom" },
  { icon: Play, text: "Playground", href: "/student/playground" },
  { icon: Swords, text: "Challenges", href: "/student/challenges" },
  // { icon: BookOpen, text: "Flashcards", href: "/student/review" },
  { icon: ChartBar, text: "Analytics", href: "/student/analytics" },
  { icon: Settings, text: "Settings", href: "#" },
  //{ icon: BookOpen, text: "Classroom", href: "/student/classroom" },
  //{ icon: ListTodo, text: "Assignments", href: "#" },
];

const Sidebar = () => (
  <aside className="fixed top-1/2 -translate-y-1/2 left-4 z-40 hidden md:block">
    <div className="flex flex-col gap-3 p-2 bg-black/20 backdrop-blur-lg border border-white/10 rounded-full">
      {sidebarItems.map((item, index) => (
        <SidebarIcon key={index} {...item} />
      ))}
    </div>
  </aside>
);

export default Sidebar;
