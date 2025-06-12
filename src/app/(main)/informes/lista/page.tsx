//src/app/(main)/informes/lista/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import MemopsyLogo from '@/app/components/MemopsyLogo';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// Select component was imported but not used in the original list, keeping it in case for future filters
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // For patient search results
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { TypographyH1, TypographyP, TypographySmall } from '@/components/ui/typography';
import { 
    ListChecks, Search, Filter, Edit, Eye, FileText as MainModuleIcon, Users, User, Loader2, AlertTriangle, XCircle,
    Menu, X, LogOut, HomeIcon, Shield, CalendarIcon 
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Interfaces
interface Informe {
  id: string;
  titulo: string;
  fechaCreacion: string; 
  esPrivado: boolean;
  psicologo?: { id: string; nombre: string; }; 
  pacientes?: Array<{ id: string; nombre: string; dni?: string }>;
}

interface PacienteInfo { 
  id: string;
  nombreCompleto: string;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  limit: number;
  totalItems: number;
}

interface SortingState {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
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

export default function ListaInformesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Navbar states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modulosPermitidos, setModulosPermitidos] = useState<ModuloConfig[]>([]);
  const [nombreCompletoNav, setNombreCompletoNav] = useState('');
  const [loadingPermissions, setLoadingPermissions] = useState(true);


  // Page specific states
  const [informes, setInformes] = useState<Informe[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For table data
  const [error, setError] = useState<string | null>(null);
  
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: parseInt(searchParams.get('page') || '1', 10),
    totalPages: 1,
    limit: 10,
    totalItems: 0,
  });
  const [filters, setFilters] = useState<{ pacienteQuery: string }>({ // General text search for patient
    pacienteQuery: searchParams.get('pacienteSearch') || '', 
  });
  const [selectedPacienteFilter, setSelectedPacienteFilter] = useState<PacienteInfo | null>(null); // Specific patient selected
  
  const [sorting, setSorting] = useState<SortingState>({
    sortBy: searchParams.get('sortBy') || 'fechaCreacion',
    sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
  });

  const [userRole, setUserRole] = useState<'psicologo' | 'paciente' | null>(null);
  const [canEditInforme, setCanEditInforme] = useState(false);
  const [hasPermissionToViewPage, setHasPermissionToViewPage] = useState<boolean|null>(null);

  const [pacienteSearchInput, setPacienteSearchInput] = useState('');
  const [pacienteSearchResults, setPacienteSearchResults] = useState<PacienteInfo[]>([]);
  const [isPacienteSearchLoading, setIsPacienteSearchLoading] = useState(false);
  const [isPacienteSearchPopoverOpen, setIsPacienteSearchPopoverOpen] = useState(false);
  const pacienteSearchPopoverRef = useRef<HTMLDivElement>(null);


  const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
      new Promise(resolve => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => resolve(func(...args)), waitFor);
      });
  };

  const fetchPacienteSuggestions = async (query: string) => {
    if (query.length < 2) {
      setPacienteSearchResults([]); return;
    }
    setIsPacienteSearchLoading(true);
    try {
      const response = await fetch(`/api/pacientes/buscar?q=${encodeURIComponent(query)}&limit=5`);
      if (!response.ok) throw new Error('Error buscando pacientes');
      const data = await response.json();
      setPacienteSearchResults((data.data || data).map((p: any) => ({ id: p.id, nombreCompleto: `${p.persona.nombre} ${p.persona.apellido}` })));
    } catch (e) { console.error(e); setPacienteSearchResults([]); } 
    finally { setIsPacienteSearchLoading(false); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchPacientes = useCallback(debounce(fetchPacienteSuggestions, 300), []);

  useEffect(() => {
    if(pacienteSearchInput.length > 1) {
        debouncedFetchPacientes(pacienteSearchInput);
    } else {
        setPacienteSearchResults([]);
    }
  }, [pacienteSearchInput, debouncedFetchPacientes]);
  
  useEffect(() => { // Click outside for patient search popover
    function handleClickOutside(event: MouseEvent) {
      if (pacienteSearchPopoverRef.current && !pacienteSearchPopoverRef.current.contains(event.target as Node)) {
        setIsPacienteSearchPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pacienteSearchPopoverRef]);


  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString()); // Preserve existing params
    params.set('page', pagination.currentPage.toString());
    params.set('limit', pagination.limit.toString());
    params.set('sortBy', sorting.sortBy);
    params.set('sortOrder', sorting.sortOrder);

    if (userRole === 'psicologo') {
        if (selectedPacienteFilter) {
            params.set('paciente', selectedPacienteFilter.id); 
            params.set('pacienteSearch', selectedPacienteFilter.nombreCompleto); // Store name for display consistency
        } else if (filters.pacienteQuery) {
            params.set('pacienteSearch', filters.pacienteQuery);
            params.delete('paciente'); // Ensure no specific ID is sent if using general search
        } else {
            params.delete('paciente');
            params.delete('pacienteSearch');
        }
    }
    router.replace(`/informes/lista?${params.toString()}`, { scroll: false });
  }, [pagination, sorting, filters, selectedPacienteFilter, userRole, router, searchParams]);


  const fetchInformes = useCallback(async () => {
    if (status !== 'authenticated' || !hasPermissionToViewPage) return;
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.append('page', pagination.currentPage.toString());
    params.append('limit', pagination.limit.toString());
    params.append('sortBy', sorting.sortBy);
    params.append('sortOrder', sorting.sortOrder);

    if (userRole === 'psicologo') {
        if (selectedPacienteFilter) {
            params.append('paciente', selectedPacienteFilter.id);
        } else if (filters.pacienteQuery) {
            params.append('paciente', filters.pacienteQuery);
        }
    }

    try {
      const response = await fetch(`/api/informes?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar los informes');
      }
      const data = await response.json();
      setInformes(data.data || []);
      setPagination(prev => ({
        ...prev,
        totalPages: data.totalPages || 1,
        totalItems: data.total || 0,
        currentPage: data.page || 1 // ensure current page is updated from response
      }));
    } catch (e: any) { setError(e.message); setInformes([]); } 
    finally { setIsLoading(false); }
  }, [status, hasPermissionToViewPage, pagination.currentPage, pagination.limit, sorting, filters.pacienteQuery, userRole, selectedPacienteFilter]);

  // Initial Load: Session and Permissions
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user) {
      const userPermisos = session.user.permisos.map((p: any) => p.nombre);
      
      // Page view permission
      const canViewPage = userPermisos.includes('Ver Informes');
      setHasPermissionToViewPage(canViewPage);
      
      if(canViewPage){
        setCanEditInforme(userPermisos.includes('Editar Informe') && !!session.user.psicologoId);
        if (session.user.psicologoId) setUserRole('psicologo');
        else if (session.user.pacienteId) setUserRole('paciente');
      }

      // Navbar permissions
      const filteredMainModules = MODULOS_DISPONIBLES.filter(module =>
        module.permisosRequeridos.some(pr => userPermisos.includes(pr))
      );
      setModulosPermitidos(filteredMainModules);
      setNombreCompletoNav(session.user.persona?.nombreCompleto || session.user.email || 'Usuario');
      setLoadingPermissions(false); // Permissions loaded
    }
  }, [session, status, router]);

  // Data fetching when dependencies change (including initial load if permissions are met)
   useEffect(() => {
    if(hasPermissionToViewPage && !loadingPermissions){ // Ensure permissions are loaded and granted
        fetchInformes();
    }
  }, [fetchInformes, hasPermissionToViewPage, loadingPermissions]);

  // URL Sync when relevant states change
  useEffect(() => {
    if(!loadingPermissions && hasPermissionToViewPage) { // only update URL if view is permitted and initial load done
        updateUrlParams();
    }
  }, [pagination.currentPage, pagination.limit, sorting.sortBy, sorting.sortOrder, filters.pacienteQuery, selectedPacienteFilter, updateUrlParams, loadingPermissions, hasPermissionToViewPage]);


  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleSortChange = (columnId: string) => {
    const isAsc = sorting.sortBy === columnId && sorting.sortOrder === 'asc';
    setSorting({ sortBy: columnId, sortOrder: isAsc ? 'desc' : 'asc' });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };
  
  const handlePacienteFilterSelect = (paciente: PacienteInfo) => {
    setSelectedPacienteFilter(paciente);
    setPacienteSearchInput(paciente.nombreCompleto); 
    setFilters(prev => ({ ...prev, pacienteQuery: paciente.nombreCompleto })); // Store name for display
    setIsPacienteSearchPopoverOpen(false);
    setPacienteSearchResults([]);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearPacienteFilter = () => {
    setSelectedPacienteFilter(null);
    setPacienteSearchInput('');
    setFilters({ pacienteQuery: '' });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };
  
  const handleApplyGeneralSearch = () => {
    setSelectedPacienteFilter(null); // Clear specific selection if any
    setFilters({ pacienteQuery: pacienteSearchInput }); // Apply current text as general search
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const navigateToModule = (ruta: string) => { router.push(ruta); setIsMenuOpen(false); };
  const handleLogout = async () => { await signOut({ redirect: true, callbackUrl: '/login' }); };

  // Render Logic
  if (status === 'loading' || loadingPermissions || hasPermissionToViewPage === null) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{ backgroundColor: '#152A2A' }}>
            <Loader2 className="h-16 w-16 animate-spin text-[#F1C77A] mb-4" />
            <TypographyP className="text-white">Cargando...</TypographyP>
        </div>
    );
  }

  if (hasPermissionToViewPage === false) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#152A2A' }}>
        <nav className="w-full p-4" style={{ backgroundColor: '#1D3434' }}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4"><div className="w-10 h-10"><MemopsyLogo /></div><h1 className="text-xl font-bold" style={{ color: '#F1C77A' }}>MemoPsy</h1></div>
                <button onClick={toggleMenu} className="p-2 rounded-lg" style={{ backgroundColor: '#152A2A' }}>{isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}</button>
            </div>
            {isMenuOpen && (
                <div className="absolute top-16 right-4 w-64 rounded-lg shadow-lg z-50" style={{ backgroundColor: '#1D3434' }}>
                    <div className="p-4 border-b border-gray-600"><p className="text-sm text-gray-300">Conectado como:</p><p className="font-semibold text-white">{session?.user?.email}</p><p className="text-sm" style={{ color: '#F1C77A' }}>{nombreCompletoNav}</p></div>
                    <div className="p-2"><h3 className="px-2 py-1 text-sm font-semibold text-gray-300 uppercase tracking-wide">Módulos</h3>{modulosPermitidos.map(m => <button key={m.id} onClick={() => navigateToModule(m.ruta)} className="w-full flex items-center px-2 py-2 text-left text-white hover:bg-[#152A2A] rounded-lg"><m.icon className="w-5 h-5 mr-3"/>{m.nombre}</button>)}</div>
                    <div className="p-2 border-t border-gray-600"><button onClick={() => router.push("/welcome")} className="w-full flex items-center px-2 py-2 text-left text-white hover:bg-[#152A2A] rounded-lg"><HomeIcon className="w-5 h-5 mr-3"/>Home</button><button onClick={handleLogout} className="w-full flex items-center px-2 py-2 text-left text-red-400 hover:bg-red-900/20 rounded-lg"><LogOut className="w-5 h-5 mr-3"/>Cerrar Sesión</button></div>
                </div>
            )}
        </nav>
        <main className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
            <div className="text-center p-8 rounded-2xl max-w-md mx-auto" style={{ backgroundColor: '#1D3434' }}>
                <AlertTriangle className="w-16 h-16 mx-auto mb-6 text-red-500" />
                <TypographyH1 className="mb-4 text-white">Acceso Denegado</TypographyH1>
                <TypographyP className="text-gray-300">No tiene permisos para ver esta lista de informes.</TypographyP>
                <Button onClick={() => router.push('/')} className="mt-6 bg-[#F1C77A] text-[#1D3434] hover:bg-opacity-80">Volver al Inicio</Button>
            </div>
        </main>
      </div>
    );
  }

  const renderPaginationControls = () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(pagination.currentPage - 1); }} className={cn("hover:bg-[#2A4A4A] hover:text-white", pagination.currentPage === 1 && "pointer-events-none opacity-50 text-gray-500")} />
        </PaginationItem>
        {[...Array(pagination.totalPages)].map((_, i) => (
          <PaginationItem key={i}>
            <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(i + 1);}} isActive={pagination.currentPage === i + 1}
              className={cn("hover:text-[#F1C77A] hover:bg-[#2A4A4A]", pagination.currentPage === i+1 && "bg-[#F1C77A] text-[#1D3434] border-[#F1C77A] hover:bg-opacity-80 hover:text-[#1D3434]")}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(pagination.currentPage + 1); }} className={cn("hover:bg-[#2A4A4A] hover:text-white", pagination.currentPage === pagination.totalPages && "pointer-events-none opacity-50 text-gray-500")} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
  
  const SortableHeader = ({ columnId, label }: { columnId: string, label: string }) => (
    <TableHead onClick={() => handleSortChange(columnId)} className="cursor-pointer hover:bg-[#2A4A4A] text-gray-200">
      {label} {sorting.sortBy === columnId && (sorting.sortOrder === 'asc' ? '▲' : '▼')}
    </TableHead>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#152A2A' }}>
      {/* Navbar */}
      <nav className="w-full p-4" style={{ backgroundColor: '#1D3434' }}>
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4"><div className="w-10 h-10"><MemopsyLogo /></div><h1 className="text-xl font-bold" style={{ color: '#F1C77A' }}>MemoPsy</h1></div>
            <button onClick={toggleMenu} className="p-2 rounded-lg" style={{ backgroundColor: '#152A2A' }}>{isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}</button>
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
        <div className="text-center mb-10">
          <TypographyH1 className="text-4xl font-bold mb-3">Lista de Informes</TypographyH1>
          <TypographyP className="text-xl text-gray-300">Consulta y gestiona los informes clínicos.</TypographyP>
        </div>

        {userRole === 'psicologo' && (
          <Card className="mb-6" style={{ backgroundColor: '#1D3434', borderColor: '#2A4A4A' }}>
            <CardHeader>
              <CardTitle className="flex items-center text-[#F1C77A]"><Filter className="mr-2 h-5 w-5" /> Filtros de Búsqueda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-0 md:flex md:space-x-4 md:items-end">
              <div className="relative flex-grow" ref={pacienteSearchPopoverRef}>
                <Label htmlFor="pacienteSearchInput" className="text-gray-200">Buscar por Paciente (Nombre/DNI)</Label>
                <div className="relative">
                    <Input
                        id="pacienteSearchInput" placeholder="Escriba para buscar paciente..." value={pacienteSearchInput}
                        onChange={(e) => {setPacienteSearchInput(e.target.value); if(e.target.value.length > 1 && !isPacienteSearchPopoverOpen) setIsPacienteSearchPopoverOpen(true);}}
                        onFocus={() => {if(pacienteSearchInput.length > 1 && pacienteSearchResults.length > 0) setIsPacienteSearchPopoverOpen(true);}}
                        className="bg-[#152A2A] text-white border-gray-600 focus:border-[#F1C77A] pr-10"
                    />
                    {pacienteSearchInput && (
                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 p-1 h-auto text-gray-400 hover:text-white" onClick={clearPacienteFilter}>
                        <XCircle className="h-5 w-5" />
                        </Button>
                    )}
                </div>
                {isPacienteSearchLoading && <Loader2 className="absolute right-10 top-[38px] h-5 w-5 animate-spin text-gray-400" />}
                {isPacienteSearchPopoverOpen && (pacienteSearchResults.length > 0 || (pacienteSearchInput.length > 1 && !isPacienteSearchLoading)) && (
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[#1D3434] border-gray-600 text-white mt-1">
                        {isPacienteSearchLoading && <div className="p-4 text-center text-sm text-gray-400">Buscando...</div>}
                        {!isPacienteSearchLoading && pacienteSearchResults.length === 0 && pacienteSearchInput.length > 1 && <div className="p-4 text-center text-sm text-gray-400">No se encontraron pacientes.</div>}
                        {!isPacienteSearchLoading && pacienteSearchResults.length > 0 && (
                        <ul className="max-h-60 overflow-y-auto">
                            {pacienteSearchResults.map(p => (
                            <li key={p.id} onClick={() => handlePacienteFilterSelect(p)} className="p-3 hover:bg-[#152A2A] cursor-pointer text-sm border-b border-gray-700 last:border-b-0">
                                {p.nombreCompleto}
                            </li>
                            ))}
                        </ul>
                        )}
                    </PopoverContent>
                )}
              </div>
              <Button onClick={handleApplyGeneralSearch} className="bg-[#F1C77A] text-[#1D3434] hover:bg-opacity-80 w-full md:w-auto">
                <Search className="mr-2 h-4 w-4" /> Aplicar Búsqueda
              </Button>
            </CardContent>
          </Card>
        )}

        {isLoading && <div className="flex justify-center items-center py-10"><Loader2 className="h-10 w-10 animate-spin text-[#F1C77A]" /> <TypographyP className="ml-3 text-gray-300">Cargando informes...</TypographyP></div>}
        {error && <div className="p-4 bg-red-900/30 text-red-300 border border-red-700 rounded-md flex items-center"><AlertTriangle className="h-5 w-5 mr-2 text-red-400" /> <TypographyP>{error}</TypographyP></div>}
        
        {!isLoading && !error && informes.length === 0 && (
          <Card className="mt-6" style={{ backgroundColor: '#1D3434', borderColor: '#2A4A4A' }}>
            <CardContent className="pt-10 pb-10 text-center">
              <MainModuleIcon className="mx-auto h-16 w-16 text-gray-500 mb-4" />
              <TypographyP className="text-gray-400">No se encontraron informes que coincidan con los criterios actuales.</TypographyP>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && informes.length > 0 && (
          <>
            <Card style={{ backgroundColor: '#1D3434', borderColor: '#2A4A4A' }}>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-[#2A4A4A]">
                    <TableRow>
                      <SortableHeader columnId="titulo" label="Título" />
                      <SortableHeader columnId="fechaCreacion" label="Fecha Creación" />
                      {userRole === 'psicologo' && <TableHead className="text-gray-200">Pacientes</TableHead>}
                      {userRole === 'paciente' && <TableHead className="text-gray-200">Psicólogo</TableHead>}
                      <TableHead className="text-gray-200">Privado</TableHead>
                      <TableHead className="text-gray-200 text-right pr-6">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {informes.map((informe) => (
                      <TableRow key={informe.id} className="border-gray-700 hover:bg-[#2A4A4A]/50">
                        <TableCell className="font-medium text-white">{informe.titulo}</TableCell>
                        <TableCell className="text-gray-300">{new Date(informe.fechaCreacion).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</TableCell>
                        {userRole === 'psicologo' && (
                          <TableCell>
                            {informe.pacientes && informe.pacientes.length > 0 
                              ? informe.pacientes.map(p => <Badge key={p.id} className="mr-1 mb-1 bg-teal-600 hover:bg-teal-500 text-white text-xs">{p.nombre}</Badge>) 
                              : <TypographySmall className="text-gray-500">N/A</TypographySmall>}
                          </TableCell>
                        )}
                        {userRole === 'paciente' && (
                          <TableCell className="text-gray-300">{informe.psicologo?.nombre || 'N/A'}</TableCell>
                        )}
                        <TableCell>{informe.esPrivado ? <Badge className="bg-red-700 hover:bg-red-600 text-white">Sí</Badge> : <Badge className="bg-green-700 hover:bg-green-600 text-white">No</Badge>}</TableCell>
                        <TableCell className="text-right space-x-1 pr-2">
                          <Button variant="ghost" size="icon" onClick={() => router.push(`/informes/detalle/${informe.id}`)} title="Ver Detalle" className="text-sky-400 hover:text-sky-300">
                            <Eye className="h-5 w-5" />
                          </Button>
                          {userRole === 'psicologo' && canEditInforme && (
                            <Button variant="ghost" size="icon" onClick={() => router.push(`/informes/editar/${informe.id}`)} title="Editar Informe" className="text-amber-400 hover:text-amber-300">
                              <Edit className="h-5 w-5" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            {pagination.totalPages > 1 && (
              <div className="mt-6 text-white">
                {renderPaginationControls()}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
