// app/(auth)/psicologos/register/page.tsx (o donde decidas ponerlo)
'use client';

import { useSession } from 'next-auth/react';
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MemopsyLogo from "@/app/components/MemopsyLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

export default function RegisterPsicologoPage() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dni, setDni] = useState(''); 
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [numeroLicencia, setNumeroLicencia] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const { data: session, status } = useSession();
  
  useEffect(() => {
    if (status === 'loading') return;
  
    if (!session || !session.user?.esAdmin) {
      toast.error('No tienes permisos para registrar usuarios.');
      router.push('/login');
    }
  }, [session, status, router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await fetch('/api/register/psicologo', { // Endpoint específico
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          apellido,
          email,
          password,
          dni,
          fechaNacimiento,
          especialidad,
          numeroLicencia,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error');

      toast.success('Psicóloga/o registrada/o exitosamente.');
      // Limpiar campos del formulario
      setNombre('');
      setApellido('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setDni('');
      setFechaNacimiento('');
      setEspecialidad('');
      setNumeroLicencia('');
      setError(null);

    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session || !session.user?.esAdmin) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <MemopsyLogo />
        <h1 className="text-2xl font-bold text-center mt-4 mb-6">Registro de Psicóloga/o</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre:</Label>
            <Input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="apellido">Apellido:</Label>
            <Input
              type="text"
              id="apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="dni">DNI:</Label>
            <Input
              type="text"
              id="dni"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="fechaNacimiento">Fecha de Nacimiento:</Label>
            <Input
              type="date"
              id="fechaNacimiento"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email:</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              className="mt-1"
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
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="especialidad">Especialidad:</Label>
            <Input
              type="text"
              id="especialidad"
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="numeroLicencia">Número de Licencia:</Label>
            <Input
              type="text"
              id="numeroLicencia"
              value={numeroLicencia}
              onChange={(e) => setNumeroLicencia(e.target.value)}
              className="mt-1"
            />
          </div>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <Button type="submit" variant="outline" className="w-full" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Registrar Psicólogo'}
          </Button>
        </form>
      </div>
    </div>
  );
}