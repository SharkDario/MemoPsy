//src/app/(main)/informes/detalle/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import MemopsyLogo from '@/app/components/MemopsyLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TypographyH1, TypographyH2, TypographyP, TypographySmall, TypographyMuted } from '@/components/ui/typography';
import { 
    FileText as MainModuleIcon, // For navbar
    FileText as PageIcon, // For page content icon
    User, Users, CalendarDays, Lock, Unlock, ArrowLeft, Loader2, AlertTriangle, Edit,
    Menu, X, LogOut, HomeIcon, Shield, CalendarIcon 
} from 'lucide-react';

// Interfaces
interface PsicologoDetalle {
  id: string;
  nombre: string;
}

interface PacienteDetalle {
  id: string;
  nombre: string;
  apellido: string;
  dni?: string;
}

interface InformeDetalle {
  id: string;
  titulo: string;
  contenido: string;
  fechaCreacion: string;
  esPrivado: boolean;
  psicologo: PsicologoDetalle | null;
  pacientes: PacienteDetalle[];
}

interface ModuloConfig {
  id: string;
  nombre: string;
  descripcion?: string;
  icon: React.ElementType;
  ruta: string;
  permisosRequeridos: string[];
}

const MODULOS_DISPONIBLES: ModuloConfig[] = [
    {
        id: "usuarios", nombre: "Usuarios", icon: Users, ruta: "/usuarios",
        permisosRequeridos: ["Ver Usuarios", "Registrar Usuario", "Editar Usuario", "Eliminar Usuario"],
    },
    {
        id: "sesiones", nombre: "Sesiones", icon: CalendarIcon, ruta: "/sesiones",
        permisosRequeridos: ["Ver Sesiones", "Registrar Sesión", "Editar Sesión", "Eliminar Sesión", "Asignar Profesional"],
    },
    {
        id: "perfiles", nombre: "Perfiles", icon: Shield, ruta: "/perfiles",
        permisosRequeridos: ["Ver Perfiles", "Registrar Perfil", "Editar Perfil", "Eliminar Perfil", "Asignar Perfil"],
    },
    {
        id: "informes", nombre: "Informes", icon: MainModuleIcon, ruta: "/informes",
        permisosRequeridos: ["Ver Informes", "Registrar Informe", "Editar Informe", "Eliminar Informe"],
    },
];

export default function DetalleInformePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  // Navbar states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modulosPermitidos, setModulosPermitidos] = useState<ModuloConfig[]>([]);
  const [nombreCompletoNav, setNombreCompletoNav] = useState('');
  const [loadingPermissions, setLoadingPermissions] = useState(true);


  // Page specific states
  const [informe, setInforme] = useState<InformeDetalle | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true); // Renamed for clarity
  const [pageError, setPageError] = useState<string | null>(null); // Renamed for clarity
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user) {
        // Navbar permissions
        const userPermissions = session.user.permisos.map((p: any) => p.nombre);;
        const filteredMainModules = MODULOS_DISPONIBLES.filter(module =>
            module.permisosRequeridos.some(pr => userPermissions.includes(pr))
        );
        setModulosPermitidos(filteredMainModules);
        setNombreCompletoNav(session.user.persona?.nombreCompleto || session.user.email || 'Usuario');
        setLoadingPermissions(false); // Navbar permissions loaded

        // Page content fetching
        if (id) {
            setIsLoadingData(true);
            fetch(`/api/informes/${id}`)
            .then(async (res) => {
                if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: `Error ${res.status}: ${res.statusText}` }));
                throw new Error(errorData.message || `Error ${res.status}`);
                }
                return res.json();
            })
            .then((data: InformeDetalle) => {
                setInforme(data);
                setPageError(null);
                if (session?.user?.psicologoId && data.psicologo?.id === session.user.psicologoId && userPermissions.includes('Editar Informe')) {
                    setCanEdit(true);
                }
            })
            .catch((err) => {
                console.error("Error fetching informe:", err);
                setPageError(err.message);
                setInforme(null);
            })
            .finally(() => {
                setIsLoadingData(false);
            });
        } else {
            setPageError("ID del informe no encontrado en la URL.");
            setIsLoadingData(false);
            setLoadingPermissions(false); // Also set this if ID is missing
        }
    } else if (status === 'loading') {
        // Keep loadingPermissions true while session is loading
        setLoadingPermissions(true);
        setIsLoadingData(true);
    }
  }, [id, status, session, router]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const navigateToModule = (ruta: string) => { router.push(ruta); setIsMenuOpen(false); };
  const handleLogout = async () => { await signOut({ redirect: true, callbackUrl: '/login' }); };


  if (loadingPermissions || isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{ backgroundColor: '#152A2A' }}>
        <Loader2 className="h-16 w-16 animate-spin text-[#F1C77A] mb-4" />
        <TypographyP className="text-white">Cargando datos...</TypographyP>
      </div>
    );
  }
  
  // Unauthenticated case is handled by useEffect redirect

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#152A2A' }}>
      {/* Navbar */}
      <nav className="w-full p-4" style={{ backgroundColor: '#1D3434' }}>
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4"><div className="w-10 h-10"><MemopsyLogo /></div><h1 className="text-xl font-bold" style={{ color: '#F1C77A' }}>MemoPsy</h1></div>
            <button onClick={toggleMenu} className="p-2 rounded-lg" style={{ backgroundColor: '#152A2A' }}><Menu className="w-6 h-6 text-white" /></button>
        </div>
        {isMenuOpen && (
            <div className="absolute top-16 right-4 w-64 rounded-lg shadow-lg z-50" style={{ backgroundColor: '#1D3434' }}>
                <div className="p-4 border-b border-gray-600"><p className="text-sm text-gray-300">Conectado como:</p><p className="font-semibold text-white">{session?.user?.email}</p><p className="text-sm" style={{ color: '#F1C77A' }}>{nombreCompletoNav}</p></div>
                <div className="p-2"><h3 className="px-2 py-1 text-sm font-semibold text-gray-300 uppercase tracking-wide">Módulos</h3>{modulosPermitidos.map(m => <button key={m.id} onClick={() => navigateToModule(m.ruta)} className="w-full flex items-center px-2 py-2 text-left text-white hover:bg-[#152A2A] rounded-lg"><m.icon className="w-5 h-5 mr-3"/>{m.nombre}</button>)}</div>
                <div className="p-2 border-t border-gray-600"><button onClick={() => router.push("/welcome")} className="w-full flex items-center px-2 py-2 text-left text-white hover:bg-[#152A2A] rounded-lg"><HomeIcon className="w-5 h-5 mr-3"/>Home</button><button onClick={handleLogout} className="w-full flex items-center px-2 py-2 text-left text-red-400 hover:bg-red-900/20 rounded-lg"><LogOut className="w-5 h-5 mr-3"/>Cerrar Sesión</button></div>
            </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-start items-center">
          <Button variant="outline" onClick={() => router.push('/informes/lista')}
            className="border-[#F1C77A] text-[#F1C77A] hover:bg-[#F1C77A] hover:text-[#1D3434]">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la lista
          </Button>
        </div>

        {pageError && (
            <Card className="border-red-700 bg-red-900/30 text-red-300 max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-6 w-6 text-red-400" /> Error al Cargar el Informe
                </CardTitle>
            </CardHeader>
            <CardContent>
                <TypographyP>{pageError}</TypographyP>
                <TypographySmall>Por favor, intente nuevamente o contacte soporte si el problema persiste.</TypographySmall>
            </CardContent>
            </Card>
        )}

        {!pageError && !informe && !isLoadingData && ( // Should only show if not loading and no error, but informe is still null
            <Card style={{ backgroundColor: '#1D3434', borderColor: '#2A4A4A' }} className="max-w-3xl mx-auto text-center">
            <CardHeader>
                <CardTitle className="text-[#F1C77A]">Informe no Disponible</CardTitle>
            </CardHeader>
            <CardContent>
                <TypographyP className="text-gray-300">No se pudo cargar la información del informe.</TypographyP>
            </CardContent>
            </Card>
        )}

        {informe && (
          <Card className="shadow-lg max-w-3xl mx-auto" style={{ backgroundColor: '#1D3434', borderColor: '#2A4A4A' }}>
            <CardHeader className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <PageIcon className="h-8 w-8 text-[#F1C77A]" />
                    <TypographyH1 className="text-3xl font-semibold text-white">{informe.titulo}</TypographyH1>
                </div>
                {canEdit && (
                    <Button onClick={() => router.push(`/informes/editar/${informe.id}`)}
                        className="bg-[#F1C77A] text-[#1D3434] hover:bg-opacity-80">
                        <Edit className="mr-2 h-4 w-4" /> Editar Informe
                    </Button>
                )}
              </div>
              <CardDescription className="text-gray-400 mt-2">
                ID del Informe: <TypographyMuted className="text-gray-500">{informe.id}</TypographyMuted>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="contenido" className="text-lg font-medium text-gray-200">Contenido del Informe</Label>
                <div 
                  id="contenido" 
                  className="mt-2 p-4 border rounded-md bg-[#152A2A] border-gray-700 whitespace-pre-wrap min-h-[150px] text-gray-300"
                >
                  {informe.contenido}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center text-gray-300">
                    <CalendarDays className="mr-2 h-5 w-5 text-[#F1C77A]" />
                    <Label className="font-semibold text-gray-200">Fecha de Creación:</Label>
                  </div>
                  <TypographyP className="ml-7 text-gray-300">{new Date(informe.fechaCreacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</TypographyP>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center text-gray-300">
                    <User className="mr-2 h-5 w-5 text-[#F1C77A]" />
                    <Label className="font-semibold text-gray-200">Psicólogo:</Label>
                  </div>
                  <TypographyP className="ml-7 text-gray-300">{informe.psicologo?.nombre || 'No especificado'}</TypographyP>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <div className="flex items-center text-gray-300">
                    {informe.esPrivado ? <Lock className="mr-2 h-5 w-5 text-red-500" /> : <Unlock className="mr-2 h-5 w-5 text-green-500" />}
                    <Label className="font-semibold text-gray-200">Privacidad:</Label>
                  </div>
                  <TypographyP className="ml-7 text-gray-300">{informe.esPrivado ? 'Privado (Solo visible para el psicólogo)' : 'No Privado (Visible para pacientes asociados)'}</TypographyP>
                </div>
              </div>
              
              <div>
                <div className="flex items-center text-gray-300 mb-2">
                    <Users className="mr-2 h-5 w-5 text-[#F1C77A]" />
                    <Label className="text-lg font-medium text-gray-200">Pacientes Asociados:</Label>
                </div>
                {informe.pacientes && informe.pacientes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {informe.pacientes.map(paciente => (
                      <Badge key={paciente.id} className="text-sm px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white">
                        {paciente.nombre} {paciente.apellido} (DNI: {paciente.dni || 'N/A'})
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <TypographyP className="ml-7 text-gray-400">Ninguno</TypographyP>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-6 bg-[#152A2A] border-t border-gray-700 rounded-b-lg text-center mt-4">
                <TypographySmall className="text-gray-500">Fin del detalle del informe.</TypographySmall>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}
