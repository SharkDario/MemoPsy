// app/(main)/psicologos/register/page.tsx (o donde decidas ponerlo)
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

// Asume que tienes componentes de formulario reutilizables o usa HTML simple
export default function RegisterPsicologoPage() {
  // Estados para nombre, apellido, email, password, dni, fechaNacimiento (como en RegisterPage)
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // ... otros estados de persona/usuario
  const [especialidad, setEspecialidad] = useState('');
  const [numeroLicencia, setNumeroLicencia] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    // Lógica similar a RegisterPage, pero llamando a /api/register/psicologo
    // y enviando todos los datos, incluyendo especialidad y numeroLicencia
    try {
       const response = await fetch('/api/register/psicologo', { // Endpoint específico
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          apellido,
          email,
          password,
          // dni, fechaNacimiento...
          especialidad,
          numeroLicencia,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error');

      alert('Psicólogo registrado exitosamente.');
      // Redirigir a donde sea apropiado (lista de psicólogos, dashboard, etc.)
      router.push('/dashboard/psicologos'); // Ejemplo

    } catch (err: any) {
       console.error("Psicologo registration error:", err);
       setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Registrar Nuevo Psicólogo</h1>
      <form onSubmit={handleSubmit}>
        {/* Campos de Persona y Usuario (puedes usar un componente) */}
        {/* ... */}
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
           {/* Considera generar una contraseña segura o un flujo de invitación */}
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {/* Campos específicos de Psicologo */}
        <div>
          <label htmlFor="especialidad">Especialidad:</label>
          <input type="text" id="especialidad" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} />
        </div>
        <div>
          <label htmlFor="numeroLicencia">Número de Licencia:</label>
          <input type="text" id="numeroLicencia" value={numeroLicencia} onChange={(e) => setNumeroLicencia(e.target.value)} />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registrando...' : 'Registrar Psicólogo'}
        </button>
      </form>
    </div>
  );
}