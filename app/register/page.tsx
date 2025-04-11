import React from 'react';
import { RegisterForm } from '@/components/auth/register-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '註冊 | 我的網站',
  description: '創建一個新帳戶',
};

export default function RegisterPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <RegisterForm />
      </div>
    </div>
  );
}
