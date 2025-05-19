"use client";

import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
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
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Handle login logic here (e.g., call Supabase auth)
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
              <FormLabel className="text-md font-bold">Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} className="h-14 font-medium"/>
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
              <FormLabel className="text-md font-bold">Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your password" {...field} className="h-14 font-medium"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <h1 className="text-xs font-semibold text-purple-700 text-right hover:underline">
          <Link href="">Forgot Password?</Link>
        </h1>

        <Button type="submit" className="w-full bg-purple-500 text-white hover:bg-purple-800 rounded-full h-14 font-bold text-md">
          Login
        </Button>
      </form>
    </Form>
  );
}
