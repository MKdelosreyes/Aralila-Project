'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button"
import Navbar from "@/components/ui/navbar/navbar-home";

export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="text-white">
        <section
        className="min-h-screen bg-[url('/images/forestbg.jpg')] bg-no-repeat bg-center bg-cover flex flex-col items-center justify-center text-center px-4"
        id="getting-started"
      >
        <h1 className="text-5xl font-bold mb-6">Welcome to Aralila</h1>
        <p className="text-lg mb-8 max-w-xl">
          Empowering Students and Teachers with Seamless Collaboration.
        </p>
        <Link href="/signup">
          <Button className="text-lg px-8 py-6 bg-white text-purple-700 hover:bg-purple-100 font-semibold rounded-full">
            Get Started
          </Button>
        </Link>
      </section>

      {/* random section for viewing*/}
      <section className="min-h-screen bg-gray-900 text-white py-20 px-4" id="testimonials">
        <h2 className="text-4xl font-bold text-center mb-10">What Our Users Say</h2>
        <div className="max-w-4xl mx-auto space-y-8">
          <blockquote className="text-xl italic">“This app changed the way I manage my class!”</blockquote>
          <blockquote className="text-xl italic">“Super easy to use. My students love it.”</blockquote>
          <blockquote className="text-xl italic">“THIS IS JUST A FORMATTING VIEW OKAY NOT FINAL”</blockquote>
        </div>
      </section>
      </main>
    </div>
  );
}
