"use client";

import Image from "next/image";
import Navbar from "@/components/navbar/navbar-home";

export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="text-white">
        <section
          className="min-h-screen bg-[url('/images/bg/bg-landing-2.png')] bg-no-repeat bg-center bg-cover flex flex-col items-center justify-center text-center px-4"
          id="getting-started"
        >
          <div className="flex flex-col items-center justify-center translate-y-45">
            <div className="portal-orbit" aria-hidden="true">
              <div className="portal-orbiter">
                <Image 
                  src="/images/overlays/portal-purple-1.svg" 
                  alt="portal" 
                  width={600} 
                  height={600} 
                  priority 
                  className="animate-[spin_10s_linear_infinite_reverse]"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}