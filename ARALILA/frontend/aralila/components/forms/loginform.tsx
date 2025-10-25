"use client";

import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api/auth";
import { useAuth } from "@/contexts/AuthContext";
// import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setIsLoading(true);

    try {
      await login(values.email, values.password);

      // Get fresh user data to determine role
      const { authAPI } = await import("@/lib/api/auth");
      const profile = await authAPI.getProfile();

      console.log("User logged in successfully:", profile);

      router.push("/student/dashboard");
    } catch (error: any) {
      console.error("Error logging in:", error);
      // Optional: Show error toast
      // toast.error(error.message || "Login failed");
      alert(error.message || "Login failed"); // Simple fallback
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 m-10"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-md font-semibold text-gray-800">
                Email
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your email"
                  {...field}
                  className="h-14 font-medium"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-md font-semibold text-gray-800">
                Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...field}
                    className="h-14 font-medium pr-10"
                    disabled={isLoading}
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

        <h1 className="text-xs font-semibold text-purple-700 text-right hover:underline">
          <Link href="/forgot-password">Forgot Password?</Link>
        </h1>

        {/* <Link href="/student/dashboard">
          <Button
            type="submit"
            className="w-full bg-purple-500 text-white hover:bg-purple-800 rounded-full h-14 font-bold text-md cursor-pointer"
          >
            Login
          </Button>
        </Link> */}
        <Button
          type="submit"
          className="w-full bg-purple-500 text-white hover:bg-purple-800 rounded-full h-14 font-bold text-md cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Form>
  );
}
