'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from "react-hot-toast";
import { Button } from '@/components/ui/button';

interface Permiso {
  id: string;
  nombre: string;
  modulo: string;
  accion: string;
  descripcion: string;
}

interface ModuloAcciones {
  [modulo: string]: string[];
}

interface ModuloDescripcion {
  [modulo: string]: string;
}

export default function CrearPerfilPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [selectedModulos, setSelectedModulos] = useState<string[]>([]);
  const [selectedPermisos, setSelectedPermisos] = useState<string[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [moduloAcciones, setModuloAcciones] = useState<ModuloAcciones>({});

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || !session.user?.esAdmin) {
      toast.error('No tienes permisos para registrar usuarios.');
      router.push('/login');
    }
  }, [session, status, router]);
  
  // Descripciones de los módulos
  const moduloDescripciones: ModuloDescripcion = {
    'Informes': 'Módulo de Informes: donde el psicólogo puede escribir su documentación relativa a informes del paciente (información sensible la cual solo el profesional tiene acceso) y a su vez notaciones de recordatorios para el paciente, los cuales podrá visualizar tanto el paciente como el psicólogo.',
    'Sesiones': 'Módulo de Sesiones: donde el/la recepcionista designa los turnos a un respectivo psicólogo y paciente, luego estos mismos podrán visualizar sus turnos asignados. El recepcionista podrá ver en el calendario todos los turnos programados con info del psicólogo y paciente.'
  };
  
  // Perfiles predefinidos sugeridos
  const perfilesSugeridos = [
    { 
      nombre: 'Perfil Psicólogo', 
      descripcion: 'Acceso a creación de informes y visualización de sesiones asignadas',
      modulos: ['Informes', 'Sesiones'],
      acciones: {
        'Informes': ['Crear', 'Leer', 'Editar', 'Eliminar', 'Crear Recordatorio', 'Leer Recordatorio', 'Editar Recordatorio', 'Eliminar Recordatorio'],
        'Sesiones': ['Leer', 'Ver Mis Sesiones']
      }
    },
    { 
      nombre: 'Perfil Recepcionista', 
      descripcion: 'Gestión de turnos y calendario',
      modulos: ['Sesiones'],
      acciones: {
        'Sesiones': ['Crear', 'Leer', 'Editar', 'Eliminar', 'Ver Calendario', 'Asignar Profesional']
      }
    },
    { 
      nombre: 'Perfil Paciente', 
      descripcion: 'Visualización de sesiones asignadas y recordatorios',
      modulos: ['Sesiones', 'Informes'],
      acciones: {
        'Sesiones': ['Leer', 'Ver Mis Sesiones'],
        'Informes': ['Leer Recordatorio']
      }
    }
  ];
  
  // Obtener todos los permisos disponibles al cargar la página
  useEffect(() => {
    const fetchPermisos = async () => {
      try {
        const response = await fetch('/api/auth/profile/permisos');
        if (!response.ok) {
          throw new Error('Error al cargar los permisos');
        }
        const data = await response.json();
        setPermisos(data);
        
        // Organizar los módulos y acciones
        const modulos: ModuloAcciones = {};
        data.forEach((permiso: Permiso) => {
          if (!modulos[permiso.modulo]) {
            modulos[permiso.modulo] = [];
          }
          if (!modulos[permiso.modulo].includes(permiso.accion)) {
            modulos[permiso.modulo].push(permiso.accion);
          }
        });
        setModuloAcciones(modulos);
      } catch (error) {
        console.error('Error:', error);
        setError('No se pudieron cargar los permisos');
      }
    };
    
    fetchPermisos();
  }, []);
  
  // Manejar cambio de selección de módulos
  const handleModuloChange = (modulo: string) => {
    setSelectedModulos(prevModulos => {
      if (prevModulos.includes(modulo)) {
        // Si se deselecciona un módulo, eliminar también sus acciones seleccionadas
        const newSelectedPermisos = selectedPermisos.filter(permisoId => {
          const permiso = permisos.find(p => p.id === permisoId);
          return permiso?.modulo !== modulo;
        });
        setSelectedPermisos(newSelectedPermisos);
        return prevModulos.filter(m => m !== modulo);
      } else {
        return [...prevModulos, modulo];
      }
    });
  };
  
  // Manejar cambio de selección de permisos
  const handlePermisoChange = (permisoId: string) => {
    setSelectedPermisos(prevPermisos => {
      if (prevPermisos.includes(permisoId)) {
        return prevPermisos.filter(id => id !== permisoId);
      } else {
        return [...prevPermisos, permisoId];
      }
    });
  };
  
  // Seleccionar un perfil predefinido
  const aplicarPerfilSugerido = (perfilIndex: number) => {
    const perfil = perfilesSugeridos[perfilIndex];
    setNombre(perfil.nombre);
    setDescripcion(perfil.descripcion);
    setSelectedModulos(perfil.modulos);
    
    // Seleccionar los permisos correspondientes
    const nuevosPermisos: string[] = [];
    permisos.forEach(permiso => {
      if (
        perfil.modulos.includes(permiso.modulo) && 
        perfil.acciones[permiso.modulo].includes(permiso.accion)
      ) {
        nuevosPermisos.push(permiso.id);
      }
    });
    setSelectedPermisos(nuevosPermisos);
  };
  
  // Enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      setError('El nombre del perfil es obligatorio');
      return;
    }
    
    if (selectedPermisos.length === 0) {
      setError('Debe seleccionar al menos un permiso');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/profile/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          descripcion,
          permisoIds: selectedPermisos,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el perfil');
      }
      
      toast.success('Perfil creado correctamente');
      //router.push('/perfiles');
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'No se pudo crear el perfil');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Perfiles</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-3">Perfiles sugeridos</h2>
        <p className="text-sm text-gray-500 mb-4">Seleccione un perfil predefinido o cree uno personalizado</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {perfilesSugeridos.map((perfil, index) => (
            <div 
              key={index} 
              className="border rounded-md p-4 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => aplicarPerfilSugerido(index)}
            >
              <h3 className="font-medium">{perfil.nombre}</h3>
              <p className="text-sm text-gray-600 mt-1">{perfil.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre *</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        
        <div>
          <h2 className="text-lg font-medium mb-2">Asignar Permisos</h2>
          <p className="text-sm text-gray-500 mb-4">Seleccione los módulos y luego las acciones específicas que desea asignar a este perfil.</p>
          
          <div className="space-y-4">
            {Object.keys(moduloAcciones).length > 0 ? (
              Object.keys(moduloAcciones).map((modulo) => (
                <div key={modulo} className="border rounded-md p-4">
                  <div className="flex items-start mb-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`modulo-${modulo}`}
                        checked={selectedModulos.includes(modulo)}
                        onChange={() => handleModuloChange(modulo)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor={`modulo-${modulo}`} className="ml-2 text-base font-medium text-gray-700">
                        {modulo}
                      </label>
                    </div>
                    
                    {moduloDescripciones[modulo] && (
                      <div className="ml-6 text-sm text-gray-500 mt-1">
                        {moduloDescripciones[modulo]}
                      </div>
                    )}
                  </div>
                  
                  {selectedModulos.includes(modulo) && (
                    <div className="ml-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4 p-3 bg-gray-50 rounded-md">
                      {permisos
                        .filter(permiso => permiso.modulo === modulo)
                        .map(permiso => (
                          <div key={permiso.id} className="flex items-start">
                            <input
                              type="checkbox"
                              id={`permiso-${permiso.id}`}
                              checked={selectedPermisos.includes(permiso.id)}
                              onChange={() => handlePermisoChange(permiso.id)}
                              className="h-4 w-4 mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="ml-2">
                              <label htmlFor={`permiso-${permiso.id}`} className="text-sm font-medium text-gray-700">
                                {permiso.accion}
                              </label>
                              {permiso.descripcion && (
                                <p className="text-xs text-gray-500">{permiso.descripcion}</p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                Cargando módulos y permisos...
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Link 
            href="/welcome" 
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
            variant="outline"
            //className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : 'Guardar Perfil'}
          </Button>
        </div>
      </form>
    </div>
  );
}