'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

type PasswordInputProps = {
  label?: string;
  id?: string;
  placeholder?: string;
  error?: FieldError;
  register: UseFormRegisterReturn;
};

export default function PasswordInput({
  label = 'Password',
  id = 'password',
  placeholder = 'Votre mot de passe',
  error,
  register,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div className="flex flex-col gap-[8px]">
      <label htmlFor={id} className="text-primary-900 font-[600] text-[14px] ml-[6px]">
        {label}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-4 top-1/2 -translate-y-1/2"
          tabIndex={-1}
        >
          <Image
            src={showPassword ? '/icons/eye-off.svg' : '/icons/eye.svg'}
            alt="Toggle visibility"
            width={20}
            height={20}
          />
        </button>

        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          placeholder={placeholder}
          className="w-full border border-primary-400 rounded-[20px] py-[20px] pl-[16px] pr-[40px] h-[40px]"
          required
          {...register}
        />
      </div>

      {error && <span className="text-red-600 text-sm">{error.message}</span>}
    </div>
  );
}
