// app/(auth)/reset-password/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MemopsyLogo from "@/app/components/MemopsyLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidLink, setIsValidLink] = useState(false);
  const [email, setEmail] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const timestamp = searchParams.get('timestamp');
    const expires = searchParams.get('expires');
    
    if (!emailParam || !timestamp || !expires) {
      setError('Enlace de recuperación inválido o incompleto.');
      return;
    }

    const currentTime = Date.now();
    const expirationTime = parseInt(expires);
    
    // Verificar si el enlace ha expirado
    if (currentTime > expirationTime) {
      setError('El enlace de recuperación ha expirado. Solicita uno nuevo.');
      return;
    }

    // Calcular tiempo restante
    const timeLeft = expirationTime - currentTime;
    const minutesLeft = Math.floor(timeLeft / (1000 * 60));
    
    if (minutesLeft > 0) {
      setTimeRemaining(`${minutesLeft} minuto${minutesLeft !== 1 ? 's' : ''}`);
    } else {
      setTimeRemaining('menos de 1 minuto');
    }

    setIsValidLink(true);
    setEmail(decodeURIComponent(emailParam));

    // Actualizar el tiempo restante cada minuto
    const interval = setInterval(() => {
      const now = Date.now();
      if (now > expirationTime) {
        setError('El enlace de recuperación ha expirado.');
        setIsValidLink(false);
        clearInterval(interval);
        return;
      }
      
      const timeLeft = expirationTime - now;
      const minutesLeft = Math.floor(timeLeft / (1000 * 60));
      
      if (minutesLeft > 0) {
        setTimeRemaining(`${minutesLeft} minuto${minutesLeft !== 1 ? 's' : ''}`);
      } else {
        setTimeRemaining('menos de 1 minuto');
      }
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!password) {
      setError("La contraseña es requerida.");
      return;
    } else if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    } else if (!/[A-Z]/.test(password)) {
      setError("La contraseña debe contener al menos una letra mayúscula.");
      return;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError("La contraseña debe contener al menos un carácter especial.");
      return;
    }

    // Verificar nuevamente que el enlace no haya expirado
    const expires = searchParams.get('expires');
    if (expires && Date.now() > parseInt(expires)) {
      setError('El enlace ha expirado durante el proceso. Solicita uno nuevo.');
      return;
    }

    setIsLoading(true);

    try {
      // Llamada a tu API para actualizar la contraseña
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          newPassword: password,
          timestamp: searchParams.get('timestamp'),
          expires: searchParams.get('expires')
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar la contraseña');
      }
      
      setSuccess(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err) {
      console.error("Password reset error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al actualizar la contraseña. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidLink || error === 'Enlace de recuperación inválido o incompleto.' || error === 'El enlace de recuperación ha expirado. Solicita uno nuevo.' || error === 'El enlace de recuperación ha expirado.') {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#152A2A' }}>
        <div className="p-8 rounded-2xl shadow-2xl w-full max-w-md" style={{ backgroundColor: '#1D3434' }}>
          <MemopsyLogo />
          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#F1C77A' }}>
              Enlace Inválido
            </h1>
            <p className="text-white mb-6">
              {error || 'El enlace de recuperación no es válido o ha expirado.'}
            </p>
            <Button 
              onClick={() => router.push('/login')}
              variant="outline" 
              className="w-full mb-3"
            >
              Volver al Login
            </Button>
            <p className="text-gray-400 text-sm">
              Puedes solicitar un nuevo enlace de recuperación desde la página de login.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#152A2A' }}>
        <div className="p-8 rounded-2xl shadow-2xl w-full max-w-md" style={{ backgroundColor: '#1D3434' }}>
          <MemopsyLogo />
          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#F1C77A' }}>
              ¡Contraseña Actualizada!
            </h1>
            <p className="text-white mb-6">
              Tu contraseña ha sido actualizada exitosamente. Serás redirigido al login en unos segundos.
            </p>
            <Button 
              onClick={() => router.push('/login')}
              variant="outline" 
              className="w-full"
            >
              Ir al Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#152A2A' }}>
      <div className="p-8 rounded-2xl shadow-2xl w-full max-w-md" style={{ backgroundColor: '#1D3434' }}>
        <MemopsyLogo />
        <h1 className="text-2xl font-bold text-center mt-4 mb-2" style={{ color: '#F1C77A' }}>
          Nueva Contraseña
        </h1>
        <p className="text-center text-gray-300 mb-2 text-sm">
          Ingresa tu nueva contraseña para {email}
        </p>
        <p className="text-center text-yellow-400 mb-6 text-xs">
          ⏰ Este enlace expira en {timeRemaining}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">Nueva Contraseña:</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder='Nueva contraseña'
              className="mt-1"
              minLength={6}
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmar Contraseña:</Label>
            <Input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder='Confirmar contraseña'
              className="mt-1"
              minLength={6}
            />
          </div>
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          <Button 
            type="submit" 
            variant="outline" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="text-sm text-blue-400 hover:text-blue-300 underline"
          >
            Volver al Login
          </button>
        </div>
      </div>
    </div>
  );
}