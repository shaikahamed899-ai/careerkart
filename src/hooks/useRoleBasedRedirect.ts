"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function useRoleBasedRedirect() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const pathname = window.location.pathname;
      
      // Employer-specific routes
      if (pathname.startsWith('/employer')) {
        if (user.role !== 'employer') {
          // Redirect job seekers to jobs page
          router.push('/jobs');
        }
      }
      
      // Job seeker-specific routes
      if (pathname.startsWith('/jobs') || pathname.startsWith('/applications')) {
        if (user.role === 'employer') {
          // Redirect employers to their dashboard
          if (!user.employer?.companyId) {
            router.push('/employer/company/setup');
          } else {
            router.push('/employer');
          }
        }
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  return { isLoading };
}
