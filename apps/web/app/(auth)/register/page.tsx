'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowRight, IconLock, IconMail, IconUser } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AuthInput } from '@/components/ui/auth-input';
import { useAuth } from '@/context/auth-context';
import { getApiErrorMessage } from '@/lib/axios';
import { RegisterFormData, registerSchema } from '@/lib/validations/auth';

function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: registerAccount } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await registerAccount({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success('Account created successfully');
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      router.push(redirectUrl);
    } catch (err: unknown) {
      const message = getApiErrorMessage(
        err,
        'An account with this email address already exists',
      );
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Card Header */}
      <div className="space-y-1.5 text-left">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Create your account</h1>
        <p className="text-sm text-zinc-500">
          Start collaborating on projects, assigning tasks, and tracking progress.
        </p>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        <AuthInput
          id="register-name"
          label="Full Name"
          icon={IconUser}
          placeholder="e.g. Jane Doe"
          type="text"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />

        <AuthInput
          id="register-email"
          label="Work Email"
          icon={IconMail}
          placeholder="name@example.com"
          type="email"
          autoComplete="username"
          error={errors.email?.message}
          {...register('email')}
        />

        <AuthInput
          id="register-password"
          label="Password"
          icon={IconLock}
          placeholder="At least 8 chars (Aa1...)"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <AuthInput
          id="register-confirm-password"
          label="Confirm Password"
          icon={IconLock}
          placeholder="Repeat your password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
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
                <span>Creating Account...</span>
              </span>
            ) : (
              <>
                <span>Get Started</span>
                <IconArrowRight className="h-4 w-4" size={16} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Switch to Login */}
      <div className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-100">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-zinc-900 hover:underline transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse bg-zinc-100/60 rounded-2xl" />}>
      <RegisterForm />
    </Suspense>
  );
}
