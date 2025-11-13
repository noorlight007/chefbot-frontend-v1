"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLoginUserMutation } from "@/redux/reducers/auth-reducer";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useAppDispatch } from "@/redux/hooks";
import { loginSuccess } from "@/redux/reducers/auth-slice";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const router = useRouter();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const dispatch = useAppDispatch();

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await loginUser(data);

      if ("data" in res) {
        const accessToken = res.data.access;
        const refreshToken = res.data.refresh;
        dispatch(loginSuccess({accessToken, refreshToken}));
        router.push("/");
        toast.success("Successfully logged in!");
      } else if ("error" in res) {
        const error = res.error as { data: { detail: string }; status: number };
        if (error.status === 401) {
          toast.error("Invalid credentials");
        } else {
          toast.error("Login failed. Please try again.");
        }
      }
    } catch {
      toast.error("An error occurred. Please try again later.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center">
          <div className="rounded-xl bg-sidebar px-5 py-3">
            <Image
              src="/logo.png"
              alt="ChefBot Logo"
              width={70}
              height={70}
              className="h-16 w-auto"
            />
          </div>
          <p className="mt-1 text-sm font-medium">
            Better Service, Better Life
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to login
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="p-5"
                  placeholder="name@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="p-5"
                    placeholder="Enter your password"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-sidebar-accent p-5 hover:bg-sidebar-accent/90"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
              </Button>
              <p className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-sidebar-accent hover:text-sidebar-accent/90"
                >
                  Sign up here
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
