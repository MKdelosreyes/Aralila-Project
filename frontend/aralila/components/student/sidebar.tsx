import SidebarIcon from "./sidebar-icon";
import { Home, BookOpen, Swords, ListTodo, Settings } from "lucide-react";

const sidebarItems = [
  { icon: Home, text: "Home", href: "/student/dashboard" },
  { icon: BookOpen, text: "Learn", href: "/student/learn" },
  { icon: Swords, text: "Challenges", href: "/student/challenges" },
  { icon: ListTodo, text: "To-Do", href: "#" },
  { icon: Settings, text: "Settings", href: "#" },
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
