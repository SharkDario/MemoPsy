//src/app/(main)/informes/editar/[id]/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import MemopsyLogo from '@/app/components/MemopsyLogo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TypographyH1, TypographyP, TypographySmall } from '@/components/ui/typography';
import { 
    FileEdit as PageIcon, // Specific icon for this page context
    Users, Search, X, Check, Loader2, AlertTriangle, Save, ArrowLeft,
    Menu, LogOut, HomeIcon, Shield, CalendarIcon, FileText as MainModuleIcon 
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Interfaces
interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  dni?: string;
  nombreCompleto?: string; 
}

interface InformeData {
  id: string;
  titulo: string;
  contenido: string;
  esPrivado: boolean;
  psicologo?: { id: string; nombre?: string };
  pacientes: Paciente[];
}

interface FormErrors {
  titulo?: string;
  contenido?: string;
  pacientesIds?: string;
  general?: string;
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

export default function EditarInformePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const informeId = params?.id as string | undefined;

  // Navbar states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modulosPermitidos, setModulosPermitidos] = useState<ModuloConfig[]>([]);
  const [nombreCompletoNav, setNombreCompletoNav] = useState('');
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    esPrivado: false,
    pacientesIds: [] as string[],
  });
  const [initialInformeTitle, setInitialInformeTitle] = useState('');
  const [selectedPacientes, setSelectedPacientes] = useState<Paciente[]>([]);
  const [pacienteSearchQuery, setPacienteSearchQuery] = useState('');
  const [pacienteSearchResults, setPacienteSearchResults] = useState<Paciente[]>([]);
  const [isPacienteSearchLoading, setIsPacienteSearchLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [pageError, setPageError] = useState<string | null>(null);
  const [isPacientePopoverOpen, setIsPacientePopoverOpen] = useState(false);
  
  const popoverRef = useRef<HTMLDivElement>(null);

  const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
      new Promise(resolve => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => resolve(func(...args)), waitFor);
      });
  };

  const fetchPacienteSuggestions = async (query: string) => {
    if (query.length < 2) { setPacienteSearchResults([]); return; }
    setIsPacienteSearchLoading(true);
    try {
      const response = await fetch(`/api/pacientes/buscar?q=${encodeURIComponent(query)}&limit=5`);
      if (!response.ok) throw new Error('Error buscando pacientes');
      const data = await response.json();
      setPacienteSearchResults((data.data || data).map((p: any) => ({
        ...p,
        nombreCompleto: `${p.persona.nombre} ${p.persona.apellido}`
      })));
    } catch (error) { console.error("Error fetching patients:", error); setPacienteSearchResults([]); } 
    finally { setIsPacienteSearchLoading(false); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchPacientes = useCallback(debounce(fetchPacienteSuggestions, 300), []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user) {
        const userPermissions = session.user.permisos.map((p: any) => p.nombre);
        // Navbar permissions
        const filteredMainModules = MODULOS_DISPONIBLES.filter(module =>
            module.permisosRequeridos.some(pr => userPermissions.includes(pr))
        );
        setModulosPermitidos(filteredMainModules);
        setNombreCompletoNav(session.user.persona?.nombreCompleto || session.user.email || 'Usuario');
        setLoadingPermissions(false);

        // Page content and specific permissions
        if (informeId) {
            setIsLoadingData(true);
            fetch(`/api/informes/${informeId}`)
            .then(async (res) => {
                if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: `Error ${res.status}` }));
                throw new Error(errorData.message || `Error ${res.status}`);
                }
                return res.json();
            })
            .then((data: InformeData) => {
                if (session?.user?.psicologoId !== data.psicologo?.id || !userPermissions.includes('Editar Informe')) {
                    setPageError("No tiene permisos para editar este informe o no es el propietario.");
                    setIsLoadingData(false);
                    return;
                }
                setFormData({
                    titulo: data.titulo,
                    contenido: data.contenido,
                    esPrivado: data.esPrivado,
                    //pacientesIds: data.pacientes.map(p => p.id),
                    pacientesIds: data.pacientes.map(p => String(p.id)), // Ensure p.id is a string
                });
                setInitialInformeTitle(data.titulo);
                setSelectedPacientes(data.pacientes.map(p => ({...p, nombreCompleto: `${p.nombre} ${p.apellido}`})));
                setPageError(null);
                setIsLoadingData(false);
            })
            .catch(err => {
                console.error("Error fetching informe data:", err);
                setPageError(err.message);
                setIsLoadingData(false);
            });
        } else {
            setPageError("ID del informe no encontrado.");
            setIsLoadingData(false);
            setLoadingPermissions(false); // Also set this if ID is missing
        }
    } else if (status === 'loading') {
        setLoadingPermissions(true);
        setIsLoadingData(true);
    }
  }, [informeId, status, session, router]);

  useEffect(() => {
    if (pacienteSearchQuery.length > 1) debouncedFetchPacientes(pacienteSearchQuery);
    else setPacienteSearchResults([]);
  }, [pacienteSearchQuery, debouncedFetchPacientes]);

  useEffect(() => { 
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) setIsPacientePopoverOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popoverRef]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const navigateToModule = (ruta: string) => { router.push(ruta); setIsMenuOpen(false); };
  const handleLogout = async () => { await signOut({ redirect: true, callbackUrl: '/login' }); };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof FormErrors]) setFormErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleCheckboxChange = (checked: boolean) => setFormData(prev => ({ ...prev, esPrivado: checked }));

  const handleSelectPaciente = (paciente: Paciente) => {
    if (!selectedPacientes.find(p => p.id === paciente.id)) {
      const newSelected = [...selectedPacientes, paciente];
      setSelectedPacientes(newSelected);
      setFormData(prev => ({ ...prev, pacientesIds: newSelected.map(p => p.id) }));
      if (formErrors.pacientesIds) setFormErrors(prev => ({...prev, pacientesIds: undefined}));
    }
    setPacienteSearchQuery(''); setPacienteSearchResults([]); setIsPacientePopoverOpen(false);
  };

  const handleRemovePaciente = (pacienteId: string) => {
    const newSelected = selectedPacientes.filter(p => p.id !== pacienteId);
    setSelectedPacientes(newSelected);
    setFormData(prev => ({ ...prev, pacientesIds: newSelected.map(p => p.id) }));
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.titulo.trim()) errors.titulo = 'El título es requerido.';
    if (!formData.contenido.trim()) errors.contenido = 'El contenido es requerido.';
    if (formData.pacientesIds.length === 0) errors.pacientesIds = 'Debe seleccionar al menos un paciente.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !informeId) return;
    setIsSubmitting(true); setFormErrors({});
    try {
      const response = await fetch(`/api/informes/${informeId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData),
      });
      if (response.ok) router.push(`/informes/detalle/${informeId}`);
      else {
        const errorData = await response.json();
        setFormErrors({ general: errorData.message || 'Error al actualizar el informe.' });
        if (errorData.errors) setFormErrors(prev => ({ ...prev, ...errorData.errors }));
      }
    } catch (error) { console.error("Submit error:", error); setFormErrors({ general: 'Error de conexión o del servidor.' }); } 
    finally { setIsSubmitting(false); }
  };

  if (loadingPermissions || isLoadingData) {
    return <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{backgroundColor: '#152A2A'}}><Loader2 className="h-16 w-16 animate-spin text-[#F1C77A] mb-4" /><TypographyP className="text-white">Cargando datos...</TypographyP></div>;
  }

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
        {pageError ? (
            <div className="text-center p-8 rounded-2xl max-w-md mx-auto" style={{ backgroundColor: '#1D3434' }}>
                <AlertTriangle className="w-16 h-16 mx-auto mb-6 text-red-500" />
                <TypographyH1 className="mb-4 text-white">Error</TypographyH1>
                <TypographyP className="text-gray-300">{pageError}</TypographyP>
                <Button onClick={() => router.push('/informes/lista')} className="mt-6 bg-[#F1C77A] text-[#1D3434] hover:bg-opacity-80">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la Lista
                </Button>
            </div>
        ) : (
        <>
            <div className="text-center mb-10">
            <TypographyH1 className="text-4xl font-bold mb-3">
                Editar Informe
            </TypographyH1>
            <TypographyP className="text-xl text-gray-300">
                Modificando: <span className="font-semibold">"{initialInformeTitle}"</span>
            </TypographyP>
            </div>
            
            <Card className="max-w-2xl mx-auto" style={{ backgroundColor: '#1D3434', borderColor: '#2A4A4A' }}>
            <CardHeader>
                <CardTitle className="text-2xl text-[#F1C77A] flex items-center"><PageIcon className="mr-3 h-7 w-7"/>Actualizar Datos</CardTitle>
                <CardDescription className="text-gray-400">Modifique los campos necesarios y guarde los cambios.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                {formErrors.general && (
                    <div className="p-3 bg-red-900/30 text-red-300 border border-red-700 rounded-md flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-400" /> <p>{formErrors.general}</p>
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="titulo" className="text-gray-200">Título del Informe</Label>
                    <Input id="titulo" name="titulo" value={formData.titulo} onChange={handleInputChange} className={cn("bg-[#152A2A] text-white border-gray-600 focus:border-[#F1C77A]", formErrors.titulo && "border-red-500")} />
                    {formErrors.titulo && <TypographySmall className="text-red-400">{formErrors.titulo}</TypographySmall>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contenido" className="text-gray-200">Contenido</Label>
                    <Textarea id="contenido" name="contenido" value={formData.contenido} onChange={handleInputChange} rows={8} className={cn("bg-[#152A2A] text-white border-gray-600 focus:border-[#F1C77A]", formErrors.contenido && "border-red-500")} />
                    {formErrors.contenido && <TypographySmall className="text-red-400">{formErrors.contenido}</TypographySmall>}
                </div>

                <div className="flex items-center space-x-3">
                    <Checkbox id="esPrivado" checked={formData.esPrivado} onCheckedChange={handleCheckboxChange} className="data-[state=checked]:bg-[#F1C77A] data-[state=checked]:text-[#1D3434] border-gray-600"/>
                    <Label htmlFor="esPrivado" className="font-normal text-gray-300">Marcar como privado</Label>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="pacienteSearch" className="text-gray-200">Pacientes Asociados</Label>
                    <div ref={popoverRef}>
                    <Popover open={isPacientePopoverOpen} onOpenChange={setIsPacientePopoverOpen}>
                        <PopoverTrigger asChild>
                        <div className="relative">
                            <Input id="pacienteSearch" type="text" placeholder="Buscar paciente..." value={pacienteSearchQuery}
                                onChange={(e) => {setPacienteSearchQuery(e.target.value); if(!isPacientePopoverOpen && e.target.value.length > 1) setIsPacientePopoverOpen(true);}}
                                onFocus={() => {if(pacienteSearchQuery.length > 1 && pacienteSearchResults.length > 0) setIsPacientePopoverOpen(true)}}
                                className={cn("bg-[#152A2A] text-white border-gray-600 focus:border-[#F1C77A] pr-10", formErrors.pacientesIds && "border-red-500")}
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                        </PopoverTrigger>
                        {isPacientePopoverOpen && (pacienteSearchResults.length > 0 || isPacienteSearchLoading) && (
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[#1D3434] border-gray-600 text-white">
                            {isPacienteSearchLoading && <div className="p-4 text-center text-sm text-gray-400">Buscando...</div>}
                            {!isPacienteSearchLoading && pacienteSearchResults.length === 0 && pacienteSearchQuery.length > 1 && <div className="p-4 text-center text-sm text-gray-400">No se encontraron pacientes.</div>}
                            {!isPacienteSearchLoading && pacienteSearchResults.length > 0 && (
                            <ul className="max-h-60 overflow-y-auto">
                                {pacienteSearchResults.map(paciente => (
                                <li key={paciente.id} onClick={() => handleSelectPaciente(paciente)} className="p-3 hover:bg-[#152A2A] cursor-pointer text-sm border-b border-gray-700 last:border-b-0">
                                    {paciente.nombreCompleto} (DNI: {paciente.dni || 'N/A'})
                                </li>))}
                            </ul>)}
                        </PopoverContent>)}
                    </Popover>
                    </div>
                    {formErrors.pacientesIds && <TypographySmall className="text-red-400">{formErrors.pacientesIds}</TypographySmall>}
                    <div className="mt-3 space-x-2 space-y-2">
                    {selectedPacientes.map(paciente => (
                        <Badge key={paciente.id} className="bg-[#F1C77A] text-[#1D3434] hover:bg-[#e0b66e] text-sm font-medium">
                        {paciente.nombreCompleto}
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemovePaciente(paciente.id)} className="ml-1.5 p-0 h-4 w-4 text-[#1D3434] hover:bg-transparent hover:text-red-500"><X className="h-3.5 w-3.5" /></Button>
                        </Badge>
                    ))}
                    </div>
                </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-3 pt-6 border-t border-gray-700 mt-6">
                <Button type="button" variant="outline" onClick={() => router.push(informeId ? `/informes/detalle/${informeId}` : '/informes/lista')}
                    className="border-[#F1C77A] text-[#F1C77A] hover:bg-[#F1C77A] hover:text-[#1D3434]">
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-[#F1C77A] text-[#1D3434] hover:bg-opacity-80">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar Cambios
                </Button>
                </CardFooter>
            </form>
            </Card>
        </>
        )}
      </main>
    </div>
  );
}
