'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSessionContext } from '@/context/SessionContext';
import { JwtHelper } from '@/utils/helpers/JwtHelper';
import { LocalStorageHelper } from '@/utils/helpers/LocalStorageHelper';
import { Icon } from '@iconify/react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, clearSession } = useSessionContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const storedSession = LocalStorageHelper.getSession();

      if (!storedSession) {
        setIsLoading(false);
        router.push('/login');
        return;
      }

      const isExpired = JwtHelper.isTokenExpired(
        LocalStorageHelper.getAccessToken() || ''
      );
      if (isExpired) {
        clearSession();
        setIsLoading(false);
        router.push('/login');
        return;
      }

      setIsLoading(false);
    };

    checkSession();
  }, [session, router, clearSession]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Icon
          icon="line-md:loading-loop"
          className="text-4xl text-gray-500 animate-spin"
        />
        <p>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
