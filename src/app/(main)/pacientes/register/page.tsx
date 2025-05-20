// app/(main)/pacientes/register/page.tsx (o donde decidas ponerlo)
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPacientePage() {
  // Estados para nombre, apellido, email, password, dni, fechaNacimiento
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // ... otros estados de persona/usuario
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

   const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    // Lógica similar, llamando a /api/register/paciente
    try {
       const response = await fetch('/api/register/paciente', { // Endpoint específico
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          apellido,
          email,
          password,
          // dni, fechaNacimiento...
          // No se necesitan datos adicionales específicos de Paciente aquí,
          // fechaRegistro se asignará en el backend.
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error');

      alert('Paciente registrado exitosamente.');
      // Redirigir a donde sea apropiado
      router.push('/dashboard/pacientes'); // Ejemplo

    } catch (err: any) {
       console.error("Paciente registration error:", err);
       setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Registrar Nuevo Paciente</h1>
       <form onSubmit={handleSubmit}>
         {/* Reutiliza los campos de Persona y Usuario */}
         <div>
          <label htmlFor="nombre">Nombre:</label>
          <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="apellido">Apellido:</label>
          <input type="text" id="apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
        </div>
         <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password">Contraseña Temporal:</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {/* No se necesitan campos adicionales para la entidad Paciente aquí */}

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registrando...' : 'Registrar Paciente'}
        </button>
      </form>
    </div>
  );
}