"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EmployerHeader } from "@/components/layouts/EmployerHeader";
import { Footer } from "@/components/layouts/Footer";
import { useAuthStore } from "@/store/authStore";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    
    if (user?.role !== "employer") {
      router.push("/");
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "employer") {
    return null;
  }

  return (
    <>
      <EmployerHeader />
      <main className="min-h-screen bg-grey-50 dark:bg-grey-950">
        {children}
      </main>
      <Footer />
    </>
  );
}
