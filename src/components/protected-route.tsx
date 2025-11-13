"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RootState } from "@/redux/store";
import { useAppSelector } from "@/redux/hooks";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const token = useAppSelector(
    (state: RootState) => (state.auth as { token: string }).token,
  );
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const decodedToken: { exp: number } = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          // Token has expired
          router.replace("/login");
        }
      } catch {
        // Invalid token format
        router.replace("/login");
      }
    }
  }, [mounted, token, router]);

  if (!mounted) return null;

  if (!token) return null;

  return <>{children}</>;
}
