"use client";

import { useLoginForm } from "@/hooks/useLoginForm";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
// import ForgotPasswordDialog from "../ForgotPasswordDialog";
import { useLogin } from "@/hooks/auth/useAuthHooks";
import { Loader2 } from "lucide-react";
import { handleApiError } from "@/lib/errors";
import PasswordInput from "../PasswordInput";
import Input from "../Input";
import { User } from "@/lib/types";
import Logo from "../logo";

const LoginForm = () => {
  const loginMutation = useLogin();
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const {
    isAuthenticated,
    isLoading,
    user,
    setAuth,
    setLoading: _,
    setLogout,
  } = useAuthStore();

  const searchParams = useSearchParams();
  useEffect(() => {
    const resetStatus = searchParams.get("reset");
    const sn = localStorage.getItem("sn");
    if(sn) setValue("store_name", sn)

    if (resetStatus === "success") {
      toast.success("Mot de passe réinitialisé avec succès ! Connectez-vous.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if(!user) return;
      if (user.is_staff) {
        window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/admin`;
      } else {
        router.replace("/");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useLoginForm();

  const onSubmit = async (data: { store_name: string; username: string; password: string }) => {
    loginMutation.mutate(data, {
      onSuccess: (user: User) => {
        localStorage.setItem("sn", user.store.name)
        toast.success("Connexion réussie !", {
          description: `Bienvenue ${user.email} sur votre tableau de bord.`,
          duration: 3000,
        });
      },
      onError: (error) => handleApiError(error),
    });
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col bg-white rounded-t-[35px] sm:rounded-[35px] pt-[48px] pb-[70px] px-[32px] min-h-[485px] w-full sm:w-[500px] gap-[32px] tracking-normal sm:leading-[100%] shadow-2xl"
      >
        <div className="flex flex-col gap-[16px] leading-tight">
          <h3 className="text-primary-900 text-[28px] font-[700]">
            Connectez-vous au <Logo/>
          </h3>
          <span className="text-[#4F5151] leading-[26px] text-[16px] font-[400]">
            Entrez-vos identifiants pour vous connecter à votre tableau de board
          </span>
        </div>

        <Input
          id="store_name"
          label="Nom du store"
          placeholder="Entrer le nom du store"
          register={register("store_name")}
          error={errors.store_name}
          type="text"
        />
         <Input
          id="username"
          label="Username"
          placeholder="Entrer votre nom d'utilisateur"
          register={register("username")}
          error={errors.username}
          type="text"
        />
        <PasswordInput
          label="Mot de passe"
          id="password"
          register={register("password")}
          error={errors.password}
        />

        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="text-right cursor-pointer text-[#4F5151] hover:text-primary-900"
        >
          Mot de passe oublié ?
        </button>

        <button
          disabled={!isValid || loginMutation.isPending}
          type="submit"
          className={`flex items-center justify-center gap-2 bg-[#00754B] text-primary-100 font-[700] text-[14px] leading-[20px] tracking-normal px-[16px] py-[10px] rounded-[20px] h-[40px] transition-opacity ${
            loginMutation.isPending || !isValid
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-[#00613F]"
          }`}
        >
          {loginMutation.isPending && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          {loginMutation.isPending ? "Connexion..." : "Me connecter"}
        </button>
      </form>
      {/* <ForgotPasswordDialog
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
      /> */}
    </>
  );
};

export default LoginForm;
