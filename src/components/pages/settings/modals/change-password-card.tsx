"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useChangePasswordMutation } from "@/redux/reducers/auth-reducer";
import { toast } from "sonner";
import * as z from "zod";
import { useTranslations } from "next-intl";

const ChangePasswordCard = ({ onClose }: { onClose: () => void }) => {
  const t = useTranslations("profile.password");

  const changePasswordSchema = z
    .object({
      old_password: z.string().min(1, t("error.currentPasswordRequired")),
      new_password: z
        .string()
        .min(8, t("error.tooShort"))
        .regex(/^(?!^\d+$).*$/, t("error.entirelyNumeric"))
        .regex(
          /[!@#$%^&*(),.?":{}|<>]/,
          t("error.missingSpecialChar")
        )
        .refine(
          (password) => {
            const commonPasswords = [
              "password",
              "12345678",
              "qwerty",
              "admin123",
            ];
            return !commonPasswords.includes(password.toLowerCase());
          },
          {
            message: t("error.tooCommon"),
          },
        ),
      confirm_new_password: z.string().min(8, t("error.newPasswordRequired")),
    })
    .refine((data) => data.new_password === data.confirm_new_password, {
      message: t("error.mismatch"),
      path: ["confirm_new_password"],
    });

  type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_new_password: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword(data).unwrap();
      onClose();
      toast.success(t("success"));
    } catch (error: unknown) {
      interface ApiError {
        data?: {
          old_password?: string[];
          new_password?: string[];
          confirm_new_password?: string[];
        };
      }

      const isApiError = (err: unknown): err is ApiError => {
        return typeof err === 'object' && err !== null && 'data' in err;
      }

      if (isApiError(error)) {
        const { data } = error;
        
        if (data?.old_password?.length) {
          form.setError("old_password", {
            message: data.old_password[0],
          });
        }
        
        if (data?.new_password?.length) {
          form.setError("new_password", {
            message: data.new_password[0],
          });
        }
        
        if (data?.confirm_new_password?.length) {
          form.setError("confirm_new_password", {
            message: data.confirm_new_password[0],
          });
        }
      }

      toast.error(t("error.generic"));
    }
  };

  return (
    <div className="w-full p-6">
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("afterSave")}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="old_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("currentPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t("currentPasswordPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("newPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t("newPasswordPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirm_new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("confirmNewPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t("confirmNewPasswordPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("updating") : t("updatePassword")}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ChangePasswordCard;
