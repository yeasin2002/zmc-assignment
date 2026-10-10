'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowRight, IconLock, IconMail, IconUser } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { AuthInput } from '@/components/ui/auth-input';
import { RegisterFormData, registerSchema } from '@/lib/validations/auth';

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setErrorMessage(null);
    try {
      // Prepared for API integration in Phase 6.3
      console.log('Register form submitted:', data);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An account with this email already exists',
      );
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

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-600 hover:text-red-900 font-bold ml-2"
          >
            &times;
          </button>
        </div>
      )}

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
          placeholder="At least 6 chars (Aa1...)"
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
