'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MemopsyLogo from "@/app/components/MemopsyLogo";
import { Button } from "@/components/ui/button";
import { Menu, X, Users, UserPlus, List, Edit3, UserCog, Calendar, FileText, Settings, Shield, LogOut } from 'lucide-react';

interface SubModuloConfig {
  id: string;
  nombre: string;
  descripcion: string;
  icon: any; // Lucide icon component
  ruta: string;
  permisoRequerido: string;
}

const SUB_MODULOS_USUARIOS: SubModuloConfig[] = [
  {
    id: 'registrar_usuario',
    nombre: 'Registrar Nuevo Usuario',
    descripcion: 'Crear cuentas para nuevos usuarios en el sistema.',
    icon: UserPlus,
    ruta: '/usuarios/registrar', // Assuming routes under /usuarios for submodules
    permisoRequerido: 'Registrar Usuario',
  },
  {
    id: 'listar_usuarios',
    nombre: 'Ver Lista de Usuarios',
    descripcion: 'Consultar y navegar el listado de todos los usuarios.',
    icon: List,
    ruta: '/usuarios/listar',
    permisoRequerido: 'Ver Usuarios',
  },
  {
    id: 'editar_usuario_general',
    nombre: 'Editar Usuarios',
    descripcion: 'Modificar información y roles de usuarios existentes (desde la lista).',
    icon: Edit3,
    ruta: '/usuarios/listar', 
    permisoRequerido: 'Editar Usuario',
  },
  {
    id: 'gestionar_estado_usuario_general',
    nombre: 'Activar/Desactivar Usuarios',
    descripcion: 'Cambiar el estado de actividad de las cuentas de usuario (desde la lista).',
    icon: UserCog, 
    ruta: '/usuarios/listar', 
    permisoRequerido: 'Eliminar Usuario', // As per issue spec, maps to "Eliminar Usuario"
  },
];

// Copied from app/(auth)/welcome/page.tsx and adapted for main navigation
interface ModuloConfig {
  id: string;
  nombre: string;
  descripcion: string;
  icon: any;
  ruta: string;
  permisosRequeridos: string[];
}

const MODULOS_DISPONIBLES: ModuloConfig[] = [
  {
    id: 'usuarios',
    nombre: 'Usuarios',
    descripcion: 'Gestión de usuarios del sistema',
    icon: Users,
    ruta: '/usuarios', // Corrected path for main module
    permisosRequeridos: ['Ver Usuarios', 'Registrar Usuario', 'Editar Usuario', 'Eliminar Usuario']
  },
  {
    id: 'sesiones',
    nombre: 'Sesiones',
    descripcion: 'Administración de sesiones',
    icon: Calendar,
    ruta: '/sesiones',
    permisosRequeridos: ['Ver Sesiones', 'Registrar Sesión', 'Editar Sesión', 'Eliminar Sesión', 'Asignar Profesional']
  },
  {
    id: 'perfiles',
    nombre: 'Perfiles',
    descripcion: 'Administración de perfiles y roles',
    icon: Shield,
    ruta: '/perfiles',
    permisosRequeridos: ['Ver Perfiles', 'Registrar Perfil', 'Editar Perfil', 'Eliminar Perfil', 'Asignar Perfil']
  },
  {
    id: 'informes',
    nombre: 'Informes',
    descripcion: 'Generación de reportes',
    icon: FileText,
    ruta: '/informes',
    permisosRequeridos: ['Ver Informes', 'Registrar Informe', 'Editar Informe', 'Eliminar Informe']
  }
];


export default function UsuariosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modulosPermitidos, setModulosPermitidos] = useState<ModuloConfig[]>([]);
  const [subModulosUsuariosPermitidos, setSubModulosUsuariosPermitidos] = useState<SubModuloConfig[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login'); // Adjusted redirect to /login as per typical auth flow
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.permisos) {
      const userPermissions = session.user.permisos.map((p: any) => p.nombre);

      // Filter main modules for sidebar
      const filteredMainModules = MODULOS_DISPONIBLES.filter(module =>
        module.permisosRequeridos.some(pr => userPermissions.includes(pr))
      );
      setModulosPermitidos(filteredMainModules);

      // Filter sub-modules for Usuarios page cards
      const filteredSubModules = SUB_MODULOS_USUARIOS.filter(subModule =>
        userPermissions.includes(subModule.permisoRequerido)
      );
      setSubModulosUsuariosPermitidos(filteredSubModules);
    }
  }, [session]);

  const handleLogout = async () => {
    await signOut({ 
      redirect: true,
      callbackUrl: '/login' 
    });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigateToModule = (ruta: string) => {
    router.push(ruta);
    setIsMenuOpen(false); 
  };

  const navigateToSubModulo = (ruta: string) => {
    router.push(ruta);
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#152A2A' }}>
        <div className="text-white text-lg">Cargando...</div>
      </div>
    );
  }

  if (!session) {
    // Should be handled by the useEffect redirect, but as a fallback
    return null; 
  }
  
  const nombreCompleto = session.user.persona
    ? `${session.user.persona.nombre} ${session.user.persona.apellido}`
    : session.user.email || 'Usuario';


  return (
    <div className="min-h-screen" style={{ backgroundColor: '#152A2A' }}>
      {/* Navigation Bar (similar to WelcomePage) */}
      <nav className="w-full p-4" style={{ backgroundColor: '#1D3434' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10">
              <MemopsyLogo />
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#F1C77A' }}>
              MemoPsy
            </h1>
          </div>
          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg hover:bg-opacity-80 transition-colors"
            style={{ backgroundColor: '#152A2A' }}
          >
            {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>

        {/* Dropdown Menu (similar to WelcomePage) */}
        {isMenuOpen && (
          <div className="absolute top-16 right-4 w-64 rounded-lg shadow-lg z-50" style={{ backgroundColor: '#1D3434' }}>
            <div className="p-4 border-b border-gray-600">
              <p className="text-sm text-gray-300">Conectado como:</p>
              <p className="font-semibold text-white">{session.user.email}</p>
              <p className="text-sm" style={{ color: '#F1C77A' }}>{nombreCompleto}</p>
            </div>
            
            <div className="p-2">
              <h3 className="px-2 py-1 text-sm font-semibold text-gray-300 uppercase tracking-wide">
                Módulos Principales
              </h3>
              {modulosPermitidos.length > 0 ? (
                modulosPermitidos.map((modulo) => {
                  const IconComponent = modulo.icon;
                  return (
                    <button
                      key={modulo.id}
                      onClick={() => navigateToModule(modulo.ruta)}
                      className="w-full flex items-center px-2 py-2 text-left text-white hover:bg-opacity-80 rounded-lg transition-colors"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#152A2A'}
                      onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                    >
                      <IconComponent className="w-5 h-5 mr-3" />
                      <div>
                        <div className="font-medium">{modulo.nombre}</div>
                        {/* <div className="text-xs text-gray-400">{modulo.descripcion}</div> */}
                      </div>
                    </button>
                  );
                })
              ) : (
                <p className="px-2 py-2 text-sm text-gray-400">
                  No tienes permisos para otros módulos.
                </p>
              )}
            </div>

            <div className="p-2 border-t border-gray-600">
              <button
                onClick={() => { /* Navigate to settings or profile */ setIsMenuOpen(false); }}
                className="w-full flex items-center px-2 py-2 text-left text-white hover:bg-opacity-80 rounded-lg transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#152A2A'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
              >
                <Settings className="w-5 h-5 mr-3" />
                Configuración
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-2 py-2 text-left text-red-400 hover:bg-red-900 hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content for Usuarios */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3" style={{ color: '#F1C77A' }}>
            Gestión de Usuarios
          </h1>
          <p className="text-xl text-gray-300">
            Administra las cuentas y perfiles de los usuarios del sistema.
          </p>
        </div>

        {/* Cards Grid for Sub-modules */}
        {subModulosUsuariosPermitidos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {subModulosUsuariosPermitidos.map((subModulo) => {
              const IconComponent = subModulo.icon;
              return (
                <div
                  key={subModulo.id}
                  className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer"
                  style={{ backgroundColor: '#1D3434' }}
                  onClick={() => navigateToSubModulo(subModulo.ruta)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 rounded-full mb-4" style={{ backgroundColor: '#152A2A' }}>
                      <IconComponent className="w-10 h-10" style={{ color: '#F1C77A' }} />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      {subModulo.nombre}
                    </h3>
                    <p className="text-gray-300 text-sm mb-6">
                      {subModulo.descripcion}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full py-3 text-lg"
                      style={{ 
                        borderColor: '#F1C77A',
                        color: '#F1C77A',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = '#F1C77A';
                        (e.target as HTMLElement).style.color = '#1D3434';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = 'transparent';
                        (e.target as HTMLElement).style.color = '#F1C77A';
                      }}
                    >
                      Acceder
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center mt-12">
            <div className="p-8 rounded-2xl max-w-md mx-auto" style={{ backgroundColor: '#1D3434' }}>
              <Users className="w-16 h-16 mx-auto mb-6" style={{ color: '#F1C77A' }}/>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Sin Acciones Disponibles en Usuarios
              </h3>
              <p className="text-gray-300">
                No tienes los permisos necesarios para realizar acciones en el módulo de usuarios. 
                Si crees que esto es un error, por favor contacta al administrador del sistema.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
