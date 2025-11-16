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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRegisterUserMutation } from "@/redux/reducers/auth-reducer";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "sonner";
import Image from "next/image";

const registerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  avatar: z.string().nullable().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;
type RegisterError = {
  status: number;
  data?: { email?: string[]; phone?: string[] };
};

export default function RegisterPage() {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarFileName, setAvatarFileName] = useState<string>("");

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      gender: "MALE",
    },
  });

  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const router = useRouter();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const formData = new FormData();
      formData.append("first_name", data.first_name);
      formData.append("last_name", data.last_name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("gender", data.gender);
      formData.append("date_of_birth", data.date_of_birth);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await registerUser(formData);

      if ("data" in res) {
        toast.success(
          "Account has been created. Check your registered mail to set password and login",
        );
        router.push(`/set-password?sessionId=${res.data.uid}`);
      } else if ("error" in res) {
        const error = res.error as RegisterError;
        if (error.status === 400 && error.data?.email) {
          toast.error(error.data.email[0], {
            duration: 4000,
          });
        } else if (error.status === 400 && error.data?.phone) {
          toast.error(error.data.phone[0], {
            duration: 4000,
          });
        } else {
          toast.error("An unexpected error occurred. Please try again.", {
            duration: 4000,
          });
        }
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const fileName = file.name;
      setAvatarFileName(fileName);
      setValue("avatar", fileName);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mb-8 flex flex-col items-center justify-center">
        <div className="rounded-xl bg-sidebar px-5 py-3">
          <Image
            src="/logo.png"
            alt="ChefBot Logo"
            width={70}
            height={70}
            className="h-16 w-auto"
          />
        </div>
        <p className="mt-1 text-sm font-medium text-gray-600">
          Better Service, Better Life
        </p>
      </div>
      <div className="mx-auto max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 pb-8">
            <CardTitle className="text-center text-2xl font-semibold">
              Register
            </CardTitle>
            <CardDescription className="text-center text-gray-500">
              Create your account to get started
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium">
                    First Name*
                  </Label>
                  <Input
                    id="first_name"
                    placeholder="John"
                    className={`${errors.first_name ? "border-red-500 focus:border-red-500" : ""}`}
                    {...register("first_name")}
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium">
                    Last Name*
                  </Label>
                  <Input
                    id="last_name"
                    placeholder="Doe"
                    className={`${errors.last_name ? "border-red-500 focus:border-red-500" : ""}`}
                    {...register("last_name")}
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email*
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone*
                </Label>
                <Controller
                  name="phone"
                  control={control}
                  defaultValue=""
                  render={({ field: { onChange, value } }) => (
                    <PhoneInput
                      country={"de"}
                      value={value}
                      onChange={(phone) => onChange("+" + phone)}
                      enableSearch={true}
                      countryCodeEditable={false}
                      searchPlaceholder="Search country..."
                      containerClass={errors.phone ? "phone-input-error" : ""}
                      inputStyle={{
                        width: "100%",
                        height: "40px",
                        fontSize: "16px",
                        padding: "8px 45px",
                        borderRadius: "6px",
                        border: errors.phone
                          ? "1px solid #ef4444"
                          : "1px solid #e2e8f0",
                      }}
                      buttonStyle={{
                        borderRadius: "6px 0 0 6px",
                        border: errors.phone
                          ? "1px solid #ef4444"
                          : "1px solid #e2e8f0",
                      }}
                      searchStyle={{
                        width: "100%",
                        padding: "8px",
                        margin: "0",
                      }}
                    />
                  )}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Gender
                  </Label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <SelectTrigger
                          className={errors.gender ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.gender && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="date_of_birth"
                    className="text-sm font-medium"
                  >
                    Date of Birth
                  </Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    className={`${errors.date_of_birth ? "border-red-500 focus:border-red-500" : ""}`}
                    {...register("date_of_birth")}
                  />
                  {errors.date_of_birth && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.date_of_birth.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar" className="text-sm font-medium">
                  Profile Picture
                </Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer file:mr-4 file:h-full file:rounded-md file:border-0 file:bg-sidebar-accent file:px-4 file:text-xs file:text-white file:transition-colors file:hover:bg-sidebar-accent/90"
                />
                {avatarFileName && (
                  <p className="mt-1 text-xs text-gray-500">
                    Selected file: {avatarFileName}
                  </p>
                )}
                {errors.avatar && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.avatar.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-6">
              <Button
                type="submit"
                className="w-full bg-sidebar-accent transition-colors hover:bg-sidebar-accent/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Loading...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-sidebar-accent hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
