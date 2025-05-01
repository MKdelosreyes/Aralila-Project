import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aralila",
  description: "Your #1 Filipino learning app",
};

export default function Home() {
  return (
    <>
      <div className="flex items-center justify-center h-screen text-3xl font-primary">
        This is the landing page/not yet implemented
      </div>
    </>
  );
}
