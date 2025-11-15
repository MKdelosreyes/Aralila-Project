"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI } from "@/lib/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const uid = searchParams.get("uid");
    const token = searchParams.get("token");

    if (!uid || !token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    verifyEmail(uid, token);
  }, [searchParams]);

  const verifyEmail = async (uid: string, token: string) => {
    try {
      const response = await authAPI.verifyEmail({ uid, token });
      setStatus("success");
      setMessage("Email verified successfully! Redirecting to dashboard...");

      // Wait 2 seconds then redirect
      setTimeout(() => {
        router.push("/student/dashboard");
      }, 2000);
    } catch (error: any) {
      setStatus("error");
      setMessage(
        error.message ||
          "Verification failed. The link may be invalid or expired."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-purple-50">
      <div className="w-full max-w-md p-6 space-y-6 text-center">
        <div className="flex justify-center">
          <Image
            src="/images/aralila-logo-tr.svg"
            alt="Aralila Logo"
            width={150}
            height={200}
            className="object-contain"
          />
        </div>

        <div className="bg-white rounded-lg p-8 shadow-lg space-y-4">
          {status === "loading" && (
            <>
              <div className="flex justify-center">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Verifying your email...
              </h2>
              <p className="text-gray-600">Please wait a moment</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center">
                <div className="bg-green-100 rounded-full p-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Email Verified!
              </h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center">
                <div className="bg-red-100 rounded-full p-4">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Verification Failed
              </h2>
              <p className="text-gray-600">{message}</p>
              <Button
                onClick={() => router.push("/signup")}
                className="w-full bg-purple-500 hover:bg-purple-700"
              >
                Back to Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-purple-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto" />
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
