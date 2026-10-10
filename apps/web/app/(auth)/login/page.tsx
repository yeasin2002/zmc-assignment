'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowRight, IconLock, IconMail } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AuthInput } from '@/components/ui/auth-input';
import { useAuth } from '@/context/auth-context';
import { getApiErrorMessage } from '@/lib/axios';
import { LoginFormData, loginSchema } from '@/lib/validations/auth';

function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data);
      toast.success('Signed in successfully');
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      router.push(redirectUrl);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Invalid email or password');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Card Header */}
      <div className="space-y-1.5 text-left">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Welcome back</h1>
        <p className="text-sm text-zinc-500">
          Enter your credentials to access your workspace and tasks.
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <AuthInput
          id="login-email"
          label="Email Address"
          icon={IconMail}
          placeholder="name@example.com"
          type="email"
          autoComplete="username"
          error={errors.email?.message}
          {...register('email')}
        />

        <AuthInput
          id="login-password"
          label="Password"
          icon={IconLock}
          placeholder="Enter your password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Submit Primary Pill Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-black py-3 px-6 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                <span>Signing in...</span>
              </span>
            ) : (
              <>
                <span>Sign in to Workspace</span>
                <IconArrowRight className="h-4 w-4" size={16} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Switch to Register */}
      <div className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-100">
        Don&apos;t have an account yet?{' '}
        <Link
          href="/register"
          className="font-semibold text-zinc-900 hover:underline transition-colors"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse bg-zinc-100/60 rounded-2xl" />}>
      <LoginForm />
    </Suspense>
  );
}
