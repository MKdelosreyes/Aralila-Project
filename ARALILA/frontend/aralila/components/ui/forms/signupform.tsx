"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap, User, Eye, EyeOff } from "lucide-react";

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
// Define the schema types for better TypeScript integration
const stepOneSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Create type from schema
type StepOneFormValues = z.infer<typeof stepOneSchema>;

const stepTwoSchema = z.object({
  role: z.enum(["student", "teacher"], {
    required_error: "Please select a role",
  }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  university: z.string().optional(),
}).refine(
  (data) => !(data.role === "teacher" && !data.university),
  {
    message: "University is required for teachers",
    path: ["university"],
  }
);

// Create type from schema
type StepTwoFormValues = z.infer<typeof stepTwoSchema>;

export default function SignupForm() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      role: undefined,
      firstName: "",
      lastName: "",
      university: "",
    },
  });

  const handleStepOneSubmit = (data: StepOneFormValues) => {
    console.log("Step 1 data:", data);
    setStep(2);
  };

  const handleStepTwoSubmit = (data: StepTwoFormValues) => {
    // Combine data from both forms for final submission
    const formData = {
      ...stepOneForm.getValues(),
      ...data,
    };
    console.log("Form submitted with data:", formData);
    // Here you would typically send the data to your API
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

              <h2 className="text-3xl font-bold text-center text-purple-500 mb-1">
                Create your account
              </h2>
              <p className="text-sm text-center text-gray-500 mb-4 font-medium">
                Step 1 of 2
              </p>
            </div>

            <Form {...stepOneForm}>
              <form onSubmit={stepOneForm.handleSubmit(handleStepOneSubmit)} className="space-y-4">
                <FormField
                  control={stepOneForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-md font-semibold">Email</FormLabel>
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
                      <FormLabel className="text-md font-semibold">Password</FormLabel>
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
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                      <FormLabel className="text-md font-semibold">Confirm Password</FormLabel>
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
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400"
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
              <h2 className="text-3xl font-black text-center text-purple-500 mb-1">
                Just a few more things...
              </h2>
              <p className="text-sm text-center text-gray-500 mb-4 font-medium">
                Step 2 of 2
              </p>
            </div>

            <Form {...stepTwoForm}>
              <form onSubmit={stepTwoForm.handleSubmit(handleStepTwoSubmit)} className="space-y-4">
                <FormField
                  control={stepTwoForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-center gap-4 mb-4">
                        <Button
                          type="button"
                          onClick={() => stepTwoForm.setValue("role", "student")}
                          variant="ghost"
                          className={`h-20 w-52 text-xl font-semibold flex items-center justify-center gap-3 transition-colors cursor-pointer
                            ${
                              field.value === "student"
                                ? "bg-purple-500 text-white"
                                : "text-purple-500 border-2 border-purple-500 hover:text-purple-500 hover:bg-purple-100"
                            }`}
                        >
                          <User size={32} />
                          Student
                        </Button>

                        <Button
                          type="button"
                          onClick={() => stepTwoForm.setValue("role", "teacher")}
                          variant="ghost"
                          className={`h-20 w-52 text-xl font-semibold flex items-center justify-center gap-3 transition-colors cursor-pointer
                            ${
                              field.value === "teacher"
                                ? "bg-purple-500 text-white"
                                : "text-purple-500 border-2 border-purple-500 hover:text-purple-500 hover:bg-purple-100"
                            }`}
                        >
                          <GraduationCap size={32} />
                          Teacher
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {stepTwoForm.watch("role") && (
                  <>
                    <FormField
                      control={stepTwoForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-md font-semibold">First Name</FormLabel>
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
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-md font-semibold">Last Name</FormLabel>
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

                    {stepTwoForm.watch("role") === "teacher" && (
                      <FormField
                        control={stepTwoForm.control}
                        name="university"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-md font-semibold">University</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="Example University"
                                className="h-12 font-medium"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-purple-500 text-white hover:bg-purple-700 h-12 rounded-full font-bold text-md cursor-pointer"
                    >
                      Create Account
                    </Button>
                  </>
                )}
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