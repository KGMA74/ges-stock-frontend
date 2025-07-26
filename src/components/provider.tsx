"use client";

import { useRetrieveUser } from "@/hooks/auth/useAuthHooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import SetSNFromURL from "./setSNFromURL";

export const queryClient = new QueryClient();

const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
  
  
  const AuthInitializer = () => {
    useRetrieveUser();
    return null;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <Suspense fallback={null}>
        <SetSNFromURL />
      </Suspense>
      {children}
    </QueryClientProvider>
  );
};

export default ReactQueryProvider;
