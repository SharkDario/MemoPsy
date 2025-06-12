//src/app/(main)/informes/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MemopsyLogo from '@/app/components/MemopsyLogo';
import { Button } from '@/components/ui/button';
import { TypographyH1, TypographyP } from '@/components/ui/typography';
import { 
    FileText, // Main icon for "Informes" in MODULOS_DISPONIBLES
    PlusSquare, // Icon for "Registrar Nuevo Informe"
    ListChecks, // Icon for "Ver Lista de Informes"
    Loader2, 
    Menu, 
    X, 
    LogOut, 
    HomeIcon, 
    Users,    // For MODULOS_DISPONIBLES
    Shield,   // For MODULOS_DISPONIBLES & "No actions" message icon
    CalendarIcon, // For MODULOS_DISPONIBLES
    ChevronRight
} from 'lucide-react';

// Interfaces (identical to perfiles/page.tsx)
interface ModuloConfig {
  id: string;
  nombre: string;
  descripcion?: string; 
  icon: React.ElementType;
  ruta: string;
  permisosRequeridos: string[];
}

interface SubModuloConfig {
  id: string;
  nombre: string;
  descripcion: string;
  icon: React.ElementType;
  ruta: string;
  permisoRequerido: string;
}

// MODULOS_DISPONIBLES (identical to perfiles/page.tsx, FileText used for Informes)
const MODULOS_DISPONIBLES: ModuloConfig[] = [
  {
    id: "usuarios",
    nombre: "Usuarios",
    descripcion: "Gestión de usuarios del sistema",
    icon: Users,
    ruta: "/usuarios",
    permisosRequeridos: ["Ver Usuarios", "Registrar Usuario", "Editar Usuario", "Eliminar Usuario"],
  },
  {
    id: "sesiones",
    nombre: "Sesiones",
    descripcion: "Administración de sesiones",
    icon: CalendarIcon,
    ruta: "/sesiones",
    permisosRequeridos: ["Ver Sesiones", "Registrar Sesión", "Editar Sesión", "Eliminar Sesión", "Asignar Profesional"],
  },
  {
    id: "perfiles",
    nombre: "Perfiles",
    descripcion: "Administración de perfiles y roles",
    icon: Shield,
    ruta: "/perfiles",
    permisosRequeridos: ["Ver Perfiles", "Registrar Perfil", "Editar Perfil", "Eliminar Perfil", "Asignar Perfil"],
  },
  {
    id: "informes",
    nombre: "Informes",
    descripcion: "Generación y consulta de informes",
    icon: FileText, // Correct icon for Informes module
    ruta: "/informes",
    permisosRequeridos: ["Ver Informes", "Registrar Informe", "Editar Informe", "Eliminar Informe"],
  },
];

// SUB_MODULOS_INFORMES (specific to this page)
const SUB_MODULOS_INFORMES: SubModuloConfig[] = [
  {
    id: 'registrar_informe',
    nombre: 'Registrar Nuevo Informe',
    descripcion: 'Crear nuevos informes clínicos para pacientes.',
    icon: PlusSquare,
    ruta: '/informes/registrar',
    permisoRequerido: 'Registrar Informe',
  },
  {
    id: 'listar_informes',
    nombre: 'Ver Lista de Informes',
    descripcion: 'Consultar y gestionar el listado de informes existentes.',
    icon: ListChecks,
    ruta: '/informes/lista',
    permisoRequerido: 'Ver Informes',
  },
];


export default function GestionInformesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State variables (identical to perfiles/page.tsx)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modulosPermitidos, setModulosPermitidos] = useState<ModuloConfig[]>([]);
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [subModulosInformesPermitidos, setSubModulosInformesPermitidos] = useState<SubModuloConfig[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true); // To manage initial load

  // useEffect for session and permissions (identical logic to perfiles/page.tsx)
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user) {
      const userPermissions = session.user.permisos.map((p: any) => p.nombre);
      
      const filteredMainModules = MODULOS_DISPONIBLES.filter(module =>
        module.permisosRequeridos.some(pr => userPermissions.includes(pr))
      );
      setModulosPermitidos(filteredMainModules);

      // Specific logic for Informes sub-modules
      const filteredSubModules = SUB_MODULOS_INFORMES.filter(subModule => {
        if (subModule.id === 'registrar_informe') {
          return userPermissions.includes(subModule.permisoRequerido) && !!session.user.psicologoId;
        }
        return userPermissions.includes(subModule.permisoRequerido);
      });
      setSubModulosInformesPermitidos(filteredSubModules);
      
      setNombreCompleto(session.user.persona?.nombreCompleto || session.user.email || 'Usuario');
      setLoadingPermissions(false);
    } else if (status === 'loading') {
        setLoadingPermissions(true); // Ensure loading state while session is resolving
    }
  }, [session, status, router]);

  // Utility functions (identical to perfiles/page.tsx)
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navigateToModule = (ruta: string) => {
    router.push(ruta);
    setIsMenuOpen(false);
  };

  const navigateToSubModulo = (ruta: string) => {
    router.push(ruta);
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  // Loading state (identical to perfiles/page.tsx)
  if (loadingPermissions) { // Combines session loading and permission processing
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{ backgroundColor: '#152A2A' }}>
        <Loader2 className="h-16 w-16 animate-spin text-[#F1C77A] mb-4" />
        <TypographyP className="text-white">Cargando...</TypographyP>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#152A2A' }}>
      {/* Navbar (identical to perfiles/page.tsx) */}
      <nav className="w-full p-4" style={{ backgroundColor: '#1D3434' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10"> <MemopsyLogo /> </div>
            <h1 className="text-xl font-bold" style={{ color: '#F1C77A' }}> MemoPsy </h1>
          </div>
          <button onClick={toggleMenu} className="p-2 rounded-lg" style={{ backgroundColor: '#152A2A' }}>
            {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>
        {isMenuOpen && (
          <div className="absolute top-16 right-4 w-64 rounded-lg shadow-lg z-50" style={{ backgroundColor: '#1D3434' }}>
            <div className="p-4 border-b border-gray-600">
              <p className="text-sm text-gray-300">Conectado como:</p>
              <p className="font-semibold text-white">{session?.user?.email}</p>
              <p className="text-sm" style={{ color: '#F1C77A' }}> {nombreCompleto} </p>
            </div>
            <div className="p-2">
              <h3 className="px-2 py-1 text-sm font-semibold text-gray-300 uppercase tracking-wide"> Módulos Principales </h3>
              {modulosPermitidos.length > 0 ? (
                modulosPermitidos.map((modulo) => {
                  const IconComponent = modulo.icon;
                  return (
                    <button key={modulo.id} onClick={() => navigateToModule(modulo.ruta)}
                      className="w-full flex items-center px-2 py-2 text-left text-white hover:bg-[#152A2A] rounded-lg transition-colors">
                      <IconComponent className="w-5 h-5 mr-3" /> {modulo.nombre}
                    </button>
                  );
                })
              ) : ( <p className="px-2 py-2 text-sm text-gray-400">No tienes permisos para otros módulos.</p> )}
            </div>
            <div className="p-2 border-t border-gray-600">
              <button onClick={() => router.push("/welcome")}
                className="w-full flex items-center px-2 py-2 text-left text-white hover:bg-[#152A2A] rounded-lg transition-colors">
                <HomeIcon className="w-5 h-5 mr-3" /> Home
              </button>
              <button onClick={handleLogout}
                className="w-full flex items-center px-2 py-2 text-left text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
                <LogOut className="w-5 h-5 mr-3" /> Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content (structure identical to perfiles/page.tsx) */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <TypographyH1 className="text-4xl font-bold mb-3">
            Gestión de Informes
          </TypographyH1>
          <TypographyP className="text-xl text-gray-300">
            Accede a las funciones de registro y consulta de informes.
          </TypographyP>
        </div>

        {status === 'authenticated' && subModulosInformesPermitidos.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl max-w-md mx-auto" style={{ backgroundColor: '#1D3434' }}>
            <FileText className="w-16 h-16 mx-auto mb-6" style={{ color: '#F1C77A' }} /> {/* Using FileText as a general icon for Informes module */}
            <h3 className="text-2xl font-semibold text-white mb-4">Sin Acciones Disponibles en Informes</h3>
            <TypographyP className="text-gray-300">
              No tienes los permisos necesarios para realizar acciones en este módulo.
              Si crees que esto es un error, por favor contacta al administrador del sistema.
            </TypographyP>
          </div>
        )}

        {status === 'authenticated' && subModulosInformesPermitidos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto"> {/* max-w-4xl to match perfiles */}
            {subModulosInformesPermitidos.map((subModulo) => {
              const IconComponent = subModulo.icon;
              return (
                <div
                  key={subModulo.id}
                  className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer"
                  style={{ backgroundColor: '#1D3434' }}
                  onClick={() => navigateToSubModulo(subModulo.ruta)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 rounded-full mb-4 inline-block" style={{ backgroundColor: '#152A2A' }}>
                      <IconComponent className="w-10 h-10" style={{ color: '#F1C77A' }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">{subModulo.nombre}</h3>
                    <p className="text-sm text-gray-300 mb-4 h-12 overflow-hidden">{subModulo.descripcion}</p> {/* Fixed height for description consistency */}
                    <Button 
                        variant="outline" 
                        className="w-full border-[#F1C77A] text-[#F1C77A] hover:bg-[#F1C77A] hover:text-[#1D3434] transition-colors group"
                    >
                        Acceder <ChevronRight className="w-4 h-4 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
