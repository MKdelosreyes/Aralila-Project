"use client";

import LoginForm from "@/components/ui/forms/loginform";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-purple-300 px-4 overflow-hidden">
      <Image
        src="/images/login-art.svg"
        alt="Login Art"
        fill
        className="absolute z-0"
        priority
      />

      <div className="relative z-10 w-full max-w-[630px] bg-white rounded-2xl shadow-md p-8 flex flex-col justify-between">
        <div className="flex flex-col items-center space-y-2">
          <Image
            src="/images/aralila-logo-tr.svg"
            alt="Aralila Logo"
            width={150}
            height={200}
            className="object-contain"
          />
          <h1 className="text-xl font-bold text-center text-gray-700">
            Pagsulat, Pag-unlad, Pagwawagi!
          </h1>
        </div>

        <LoginForm />

        <p className="text-xs md:text-sm text-center text-gray-600 font-semibold">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-purple-700 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
