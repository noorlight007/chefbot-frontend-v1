import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUpdateUserInfoMutation } from "@/redux/reducers/auth-reducer";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useLocale } from "@/components/providers/LocalProviders";
import { useTranslations } from "next-intl";

const formSchema = z.object({
  avatar: z.instanceof(File).optional(),
  first_name: z.string().min(1, { message: "First name is required" }),
  last_name: z.string().min(1, { message: "Last name is required" }),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  date_of_birth: z.string().min(1, { message: "Date of birth is required" }),
  language: z.enum([
    "ENGLISH",
    "GERMAN",
  ]),
});

type ProfileFormData = z.infer<typeof formSchema>;

interface UpdateProfileProps {
  onClose: () => void;
  userInfo: ProfileFormData & { avatar?: string };
}

// Language mapping between your enum values and locale codes
const LANGUAGE_TO_LOCALE_MAP = {
  ENGLISH: "en" as const,
  GERMAN: "de" as const,
};

const UpdateProfile: React.FC<UpdateProfileProps> = ({ onClose, userInfo }) => {
  const [updateUserInfo, { isLoading }] = useUpdateUserInfoMutation();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { setLocale } = useLocale();
  const t = useTranslations("profile");

  useEffect(() => {
    if (userInfo.avatar) {
      setImagePreview(userInfo.avatar);
    }
  }, [userInfo.avatar]);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: userInfo.first_name || "",
      last_name: userInfo.last_name || "",
      gender: userInfo.gender || "MALE",
      date_of_birth: userInfo.date_of_birth || "",
      language: userInfo.language || "ENGLISH",
    },
  });

  const onSubmitHandler = async (data: ProfileFormData) => {
    try {
      const validatedData = formSchema.parse(data);

      const formData = new FormData();

      if (validatedData.avatar) {
        formData.append("avatar", validatedData.avatar);
      }
      formData.append("first_name", validatedData.first_name);
      formData.append("last_name", validatedData.last_name);
      formData.append("gender", validatedData.gender);
      formData.append("date_of_birth", validatedData.date_of_birth);
      formData.append("language", validatedData.language);

      const res = await updateUserInfo(formData);
      if ("data" in res) {
        toast.success(t("updateSuccess"));

        // Update locale based on selected language
        const newLocale = LANGUAGE_TO_LOCALE_MAP[validatedData.language];
        setLocale(newLocale);

        onClose();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(t("updateError"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">{t("updateProfile")}</h2>
        </div>

        <FormField
          control={form.control}
          name="avatar"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>{t("avatar")}</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {imagePreview && (
                    <div className="h-32 w-32 overflow-hidden rounded-full">
                      <Image
                        width={100}
                        height={100}
                        src={imagePreview}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onChange(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    {...field}
                    value=""
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("firstName")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("firstName")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("lastName")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("lastName")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("gender")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("gender")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MALE">{t("male")}</SelectItem>
                  <SelectItem value="FEMALE">{t("female")}</SelectItem>
                  <SelectItem value="OTHER">{t("other")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_of_birth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("dateOfBirth")}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("orgLanguage")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("orgLanguage")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ENGLISH">{t("english")}</SelectItem>
                  <SelectItem value="GERMAN">{t("german")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t("updating") : t("updateProfile")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UpdateProfile;
