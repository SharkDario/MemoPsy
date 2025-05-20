import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.esAdmin) {
      toast.error('No tienes permisos para acceder aquí.');
      router.push('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) return null; // No muestra nada mientras verifica

  return <>{children}</>;
}
