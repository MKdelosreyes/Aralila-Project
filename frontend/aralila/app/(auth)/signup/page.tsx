"use client";

import Image from "next/image";
import SignupForm from "@/components/ui/forms/signupform";

export default function SignupPage() {
  return (
<div className="min-h-screen flex items-center justify-center bg-purple-50 px-4 max-h-screen overflow-hidden">

  <div className="w-full md:w-1/2 p-8 flex flex-col justify-center max-h-screen">
    <SignupForm />
  </div>


  <div className="hidden md:flex md:w-1/2 items-center justify-center max-h-screen">
    <Image
      src="/images/signup-art.svg"
      alt="Signup Art"
      width={600}       
      height={400}       
      className="object-contain max-h-[90vh] max-w-full"
    />
  </div>
</div>

  );
}
