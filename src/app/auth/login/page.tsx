"use client";
import LoginForm from "@/components/form/LoginForm";
import LoginFormSkeleton from "@/components/form/LoginFormSkeleton";
// import Logo from "@/components/logo";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

const Page = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user]);

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="absolute sm:static bottom-0 sm:flex flex-col w-full justify-center items-center gap-[58px]">
        <div className="max-sm:mx-auto max-sm:mb-[58px] flex justify-center">
          {/* <Logo h={73} w={150} /> */}
        </div>
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
