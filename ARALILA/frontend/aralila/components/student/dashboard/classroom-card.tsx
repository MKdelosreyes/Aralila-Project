import Link from "next/link";
import Image from "next/image";
import DashboardCard from "./dashboard-card";

const ClassroomCard = () => {
  return (
    <Link href="/student/classroom/" className="col-span-full flex justify-center items-center group">
      <DashboardCard className="p-0 overflow-hidden relative justify-end max-w-4xl w-full min-h-[30rem]"> {/* Added min-h-[30rem] for a taller rectangular shape */}
        <Image
            src="/images/art/game-art-1.png"
            alt="Classroom Artwork"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="relative z-10 p-6">
            <p className="text-sm text-white font-semibold">Jump back in</p>
            <h3 className="text-2xl font-bold mt-1 text-white">Filipino 7</h3>
            <p className="text-sm text-purple-200 mt-2 group-hover:text-purple-100 transition-colors">
                Continue your last lesson &rarr;
            </p>
        </div>
      </DashboardCard>
    </Link>
  );
};

export default ClassroomCard;