import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function useAuthCheck() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth', {
          credentials: 'include', // if you're using cookies
        });
        const data = await res.json();

        if (!data.success || !data.user || data.user.isBanned) {
          router.push('/login');
        }
        // else do nothing (user is valid)
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);
}
