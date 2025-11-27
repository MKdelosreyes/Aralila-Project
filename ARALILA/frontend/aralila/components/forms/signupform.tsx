"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Mail } from "lucide-react";
import { authAPI } from "@/lib/api/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const stepOneSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type StepOneFormValues = z.infer<typeof stepOneSchema>;

const stepTwoSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required" }),
  last_name: z.string().min(1, { message: "Last name is required" }),
  school_name: z.string().optional(),
});

type StepTwoFormValues = z.infer<typeof stepTwoSchema>;

export default function SignupForm() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const router = useRouter();

  const stepOneForm = useForm<StepOneFormValues>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const stepTwoForm = useForm<StepTwoFormValues>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      school_name: "",
    },
  });

  const handleStepOneSubmit = (data: StepOneFormValues) => {
    console.log("Step 1 data:", data);
    setStep(2);
  };

  const handleStepTwoSubmit = async (data: StepTwoFormValues) => {
    const formData = {
      ...stepOneForm.getValues(),
      ...data,
      confirmPassword: undefined,
    };

    console.log("Form submitted with data:", formData);
    setIsLoading(true);

    try {
      const response = await authAPI.register(formData);
      console.log("User registered successfully:", response);

      setRegisteredEmail(formData.email);
      setShowVerificationMessage(true);
    } catch (error: any) {
      console.error("Registration failed:", error);
      alert(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      await authAPI.resendVerification(registeredEmail);
      alert("Verification email sent! Please check your inbox.");
    } catch (error: any) {
      alert(error.message || "Failed to resend verification email");
    } finally {
      setIsLoading(false);
    }
  };

  if (showVerificationMessage) {
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
            <div className="flex justify-center">
              <div className="bg-purple-100 rounded-full p-4">
                <Mail className="w-12 h-12 text-purple-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              Verify your email
            </h2>

            <p className="text-gray-600">We've sent a verification link to:</p>
            <p className="text-purple-600 font-semibold">{registeredEmail}</p>

            <p className="text-sm text-gray-500">
              Please check your inbox and click the verification link to
              activate your account.
            </p>

            <div className="pt-4 space-y-2">
              <p className="text-sm text-gray-600">Didn't receive the email?</p>
              <Button
                onClick={handleResendVerification}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? "Sending..." : "Resend verification email"}
              </Button>
            </div>

            <div className="pt-4">
              <Link
                href="/login"
                className="text-purple-600 hover:underline text-sm"
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-purple-50">
      <div className="w-full max-w-md p-6 space-y-12">
        {step === 1 && (
          <>
            <div>
              <div className="flex justify-center">
                <Image
                  src="/images/aralila-logo-tr.svg"
                  alt="Aralila Logo"
                  width={150}
                  height={200}
                  className="object-contain"
                />
              </div>

              <h2 className="text-3xl font-bold text-center text-gray-800 mb-1">
                Create your account
              </h2>
              <p className="text-sm text-center text-gray-500 mb-4 font-medium">
                Step 1 of 2
              </p>
            </div>

            <Form {...stepOneForm}>
              <form
                onSubmit={stepOneForm.handleSubmit(handleStepOneSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={stepOneForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-md font-semibold text-gray-800 ">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          className="h-12 font-medium"
                          placeholder="Enter your email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={stepOneForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-md font-semibold text-gray-800">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            className="h-12 font-medium pr-10"
                            placeholder="Enter your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={stepOneForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-md font-semibold text-gray-800">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            className="h-12 font-medium pr-10"
                            placeholder="Confirm your password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400"
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-purple-500 text-white hover:bg-purple-700 h-12 rounded-full font-bold text-md cursor-pointer"
                >
                  Next
                </Button>
              </form>
            </Form>

            <p className="text-sm text-center text-gray-600 font-semibold">
              Already have an account?{" "}
              <Link href="/login" className="text-purple-700 hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <div className="flex justify-center">
                <Image
                  src="/images/aralila-logo-tr.svg"
                  alt="Aralila Logo"
                  width={150}
                  height={200}
                  className="object-contain"
                />
              </div>
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-1">
                Just a few more things...
              </h2>
              <p className="text-sm text-center text-gray-500 mb-4 font-medium">
                Step 2 of 2
              </p>
            </div>

            <Form {...stepTwoForm}>
              <form
                onSubmit={stepTwoForm.handleSubmit(handleStepTwoSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={stepTwoForm.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-md font-semibold text-gray-800">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Juan"
                          className="h-12 font-medium"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={stepTwoForm.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-md font-semibold text-gray-800">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Dela Cruz"
                          className="h-12 font-medium"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={stepTwoForm.control}
                  name="school_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-md font-semibold text-gray-800">
                        School/University (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Your school name"
                          className="h-12 font-medium"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-purple-500 text-white hover:bg-purple-700 h-12 rounded-full font-bold text-md cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>

            <p className="text-sm text-center text-gray-600 font-semibold">
              Already have an account?{" "}
              <Link href="/login" className="text-purple-700 hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
