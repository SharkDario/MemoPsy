'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import MemopsyLogo from "@/app/components/MemopsyLogo";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Si no hay sesión activa, redirigir al login
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
  }, [session, status]);

  // Redirigir a páginas específicas según el rol
  const goToDashboard = () => {
    router.push('/dashboard');
  };

  // Función para manejar cerrar sesión
  const handleLogout = async () => {
    router.push('/api/auth/signout');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg text-center">
        <MemopsyLogo />
        <h1 className="text-3xl font-bold mt-6 mb-2">¡Bienvenido/a a Memopsy!</h1>
        
        {session?.user && (
          <div className="mt-4 mb-6">
            <p className="text-xl mb-1">Hola, {session.user.name || session.user.email}</p>
            <p className="text-gray-600">
              {session.user.esAdmin ? 'Acceso de Administrador' : 'Acceso de Usuario'}
            </p>
          </div>
        )}

        <div className="space-y-4 mt-8">
          {/*}
          <Button onClick={goToDashboard} className="w-full py-6 text-lg">
            Ir al Panel Principal
          </Button> -->
          */}

          {session?.user?.esAdmin && (
            <>
              {/*}
              <Button 
                onClick={() => router.push('/admin')} 
                variant="outline" 
                className="w-full py-6 text-lg"
              >
                Panel de Administración
              </Button>
              */}
              {/* Nuevos botones para registrar usuarios, pacientes y psicólogos */}
              <div className="grid grid-cols-1 gap-3 mt-4">
                <h2 className="text-lg font-semibold">Módulo de Usuarios</h2>
                <Button 
                  onClick={() => router.push('/register')} 
                  variant="outline" 
                  className="w-full py-5"
                >
                  Registrar Empleado
                </Button>
                <Button 
                  onClick={() => router.push('/register/paciente')} 
                  variant="outline" 
                  className="w-full py-5"
                >
                  Registrar Paciente
                </Button>
                <Button 
                  onClick={() => router.push('/register/psicologo')} 
                  variant="outline" 
                  className="w-full py-5"
                >
                  Registrar Psicólogo
                </Button>
              </div>
            </>
          )}

          {session?.user?.esAdmin && (
            <>
              <div className="grid grid-cols-1 gap-3 mt-4">
                <h2 className="text-lg font-semibold">Módulo de Permisos</h2>
                <Button 
                  onClick={() => router.push('/profile/crear')} 
                  variant="outline" 
                  className="w-full py-5"
                >
                  Personalización de Perfiles
                </Button>
                <Button 
                  onClick={() => router.push('/profile/asignar')} 
                  variant="outline" 
                  className="w-full py-5"
                >
                  Asignación de Perfiles
                </Button>
              </div>
            </>
          )}
          
          <Button 
            onClick={handleLogout} 
            variant="destructive" 
            className="w-full py-6 text-lg mt-6"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
}