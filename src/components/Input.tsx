'use client';

import { InputHTMLAttributes, useState } from 'react';
import Image from 'next/image';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

interface InputProps extends InputHTMLAttributes<HTMLInputElement>  {
  label?: string;
  id?: string;
  placeholder?: string;
  error?: FieldError;
  type: string
  register: UseFormRegisterReturn;
};

export default function Input({
  label = '',
  id = '',
  placeholder = '',
  error,
  register,
  ...rest
}: InputProps) {

  return (
      <div className="flex flex-col gap-[8px]">
          <label
            htmlFor={id}
            className="text-primary-900 font-[600] text-[14px] ml-[6px]"
          >
           {label}
          </label>
       <input
          id={id}
          placeholder={placeholder}
          className="w-full border border-primary-400 rounded-[20px] py-[20px] pl-[16px] pr-[40px] h-[40px]"
          required
          {...register}
          {...rest}
        />
          {error && (
            <span className="text-red-600 text-sm">
              {error.message}
            </span>
          )}
        </div>
  );
}
