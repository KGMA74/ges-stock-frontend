"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import PageLoader from "./PageLoader";


type Props = {
  children: React.ReactNode;
  requiredPermissions?: string[];
};
const AuthGuard = ({ children, requiredPermissions }: Props) => {
  const router = useRouter();
  const pathname = usePathname()
  const { isLoading, user } = useAuthStore();

  const hasRequiredPermissions = () => {
    if (!requiredPermissions || requiredPermissions?.length === 0) return true;
    //TODO: DECOMMENTER apres gestion des authentifications
    // return requiredPermissions.every((perm) => user.permissions.includes(perm));
  };

  useEffect(() => {
    if (!isLoading) {
      if (!user) return router.replace("/auth/login");
      if (user.is_staff) window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/admin`;
      if (!hasRequiredPermissions()) return router.push("/404");
    }
  }, [isLoading, user, router]);

  if (pathname.startsWith('/auth') || (!isLoading && user && !user.is_staff)) {
    return <>{children}</>;
  }

  return (
    <PageLoader />
  );
};

export default AuthGuard;
