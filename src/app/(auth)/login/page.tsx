// app/(auth)/login/page.tsx
'use client'; // Necesario para hooks y manejo de eventos

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Usar 'next/navigation' en App Router
import MemopsyLogo from "@/app/components/MemopsyLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null); // Limpiar errores previos

    try {
      const result = await signIn('credentials', {
        redirect: false, // No redirigir automáticamente, manejaremos manualmente
        email: email,
        password: password,
      });

      if (result?.error) {
        // Manejar errores de autenticación (ej. credenciales incorrectas)
        console.error("Login error:", result.error);
        setError('Email o contraseña incorrectos.');
      } else if (result?.ok) {
        // Inicio de sesión exitoso, redirigir al dashboard o página principal
        router.push('/welcome'); // O la ruta deseada después del login
        router.refresh(); // Asegura que el estado del servidor se actualice
      }
    } catch (err) {
       console.error("Unexpected login error:", err);
       setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#152A2A' }}>
      <div className="p-8 rounded-2xl shadow-2xl w-full max-w-md" style={{ backgroundColor: '#1D3434' }}>
        <MemopsyLogo />
        <h1 className="text-2xl font-bold text-center mt-4 mb-6" style={{ color: '#F1C77A' }}>Iniciar Sesión</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email:</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder='Correo electrónico'
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña:</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder='Contraseña'
              className="mt-1 white"
            />
          </div>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <Button type="submit" variant="outline" className="w-full">Ingresar</Button>
        </form>
      </div>
    </div>
  );
}

/*
'use client'; // Necesario para hooks y manejo de eventos

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Usar 'next/navigation' en App Router

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null); // Limpiar errores previos

    try {
      const result = await signIn('credentials', {
        redirect: false, // No redirigir automáticamente, manejaremos manualmente
        email: email,
        password: password,
      });

      if (result?.error) {
        // Manejar errores de autenticación (ej. credenciales incorrectas)
        console.error("Login error:", result.error);
        setError('Email o contraseña incorrectos.');
      } else if (result?.ok) {
        // Inicio de sesión exitoso, redirigir al dashboard o página principal
        router.push('/dashboard'); // O la ruta deseada después del login
        router.refresh(); // Asegura que el estado del servidor se actualice
      }
    } catch (err) {
       console.error("Unexpected login error:", err);
       setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
    }
  };

  return (
    <div>
      <h1>Iniciar Sesión</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Ingresar</button>
      </form>
      <p>¿No tienes cuenta? <a href="/register">Regístrate</a></p>
    </div>
  );
}*/