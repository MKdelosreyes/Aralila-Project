
import { Star, Trophy, Flame, ShieldCheck } from "lucide-react";
import DashboardCard from "./dashboard-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ProfileCardProps = {
  student: {
    fullName: string;
    avatar: string; // Add avatar to student object
  };
};

const ProfileCard = ({ student }: ProfileCardProps) => {
  return (
    <DashboardCard className="col-span-2 md:col-span-2 md:row-span-2 justify-center items-center text-center">
<Avatar className="relative ring-2 ring-purple-500 shadow-[0_0_12px_3px_rgba(168,85,247,0.5)]">
  <AvatarImage
    alt="Student Avatar"
    className="object-cover"
  />
  <AvatarFallback className="bg-purple-900 text-white">AL</AvatarFallback>
</Avatar>
      <h2 className="text-3xl font-bold text-white">{student.fullName}</h2>
      <p className="text-purple-300 mb-6">Level 12 - Grammar Guru</p>

      <div className="w-full max-w-xs grid grid-cols-2 gap-4 text-left">
        <div className="bg-black/20 p-3 rounded-lg flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-400 flex-shrink-0"/>
            <div>
                <p className="font-bold text-lg">14,500</p>
                <p className="text-xs text-slate-400">EXP</p>
            </div>
        </div>
        <div className="bg-black/20 p-3 rounded-lg flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-500 flex-shrink-0"/>
            <div>
                <p className="font-bold text-lg">Gold II</p>
                <p className="text-xs text-slate-400">Rank</p>
            </div>
        </div>
        <div className="bg-black/20 p-3 rounded-lg flex items-center gap-3">
            <Flame className="w-6 h-6 text-red-500 flex-shrink-0"/>
            <div>
                <p className="font-bold text-lg">15</p>
                <p className="text-xs text-slate-400">Day Streak</p>
            </div>
        </div>
        <div className="bg-black/20 p-3 rounded-lg flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-sky-400 flex-shrink-0"/>
            <div>
                <p className="font-bold text-lg">24</p>
                <p className="text-xs text-slate-400">Badges</p>
            </div>
        </div>
      </div>
    </DashboardCard>
  );
};

export default ProfileCard;