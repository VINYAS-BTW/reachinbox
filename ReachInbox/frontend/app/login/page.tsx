'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignInScreen() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-neutral-500">Loading</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[420px] shrink-0 bg-neutral-950 text-white flex-col justify-between p-10">
        <div>
          <p className="text-sm font-medium tracking-wide uppercase text-neutral-400">ReachInbox</p>
          <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight">
            Schedule outbound email at scale.
          </h1>
          <p className="mt-4 text-neutral-400 text-sm leading-relaxed max-w-xs">
            Upload leads, set timing and rate limits, and track delivery from one dashboard.
          </p>
        </div>
        <p className="text-xs text-neutral-600">BY SAI VINYAS </p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-[360px]">
          <div className="lg:hidden mb-10">
            <p className="text-sm font-medium text-neutral-900">ReachInbox</p>
            <p className="mt-1 text-sm text-neutral-500">Sign in to manage your campaigns</p>
          </div>

          <div className="hidden lg:block mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">Sign in</h2>
            <p className="mt-1 text-sm text-neutral-500">Use your Google account to continue</p>
          </div>

          <button
            type="button"
            onClick={() => signIn('google')}
            className="w-full flex items-center justify-center gap-3 border border-neutral-200 bg-white text-neutral-900 py-2.5 px-4 text-sm font-medium rounded-lg cursor-pointer"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-8 text-xs text-neutral-400 leading-relaxed">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
