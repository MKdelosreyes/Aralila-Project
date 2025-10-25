"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { authAPI } from "@/lib/api/auth";
import { useAuth } from "@/contexts/AuthContext";
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

// Define validation schemas for each step
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
  const router = useRouter();
  const { login } = useAuth();

  // Form for step 1
  const stepOneForm = useForm<StepOneFormValues>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Form for step 2
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
      await authAPI.register(formData);
      console.log("User registered successfully");

      await login(formData.email, formData.password);

      // Redirect to dashboard (no role-based routing)
      router.push("/student/dashboard");
    } catch (error: any) {
      console.error("Registration failed:", error);
      alert(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

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
