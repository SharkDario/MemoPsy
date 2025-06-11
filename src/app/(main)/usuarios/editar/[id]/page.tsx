'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import MemopsyLogo from "@/app/components/MemopsyLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch"; // For 'activo' status
import { Menu, X, Users, Calendar, FileText, LogOut, HomeIcon, Shield, UserCircle, Briefcase, Activity, AlertCircle } from 'lucide-react';

// Define types according to new structure
interface ObraSocial {
  id_obra_social: string; 
  nombre: string;
}

interface PsicologoDetails { // For data fetched specifically from /api/psicologos/{id}
  id_psicologo: string;
  especialidad: string;
  numeroLicencia: string;
}

interface PacienteDetails { // For data fetched specifically from /api/pacientes/{id}
  id_paciente: string;
  id_obra_social: string | null; // Directly the ID
  // If the endpoint returns the full ObraSocial object:
  // obraSocial?: ObraSocial | null; 
}

interface PersonaDetails {
  id_persona: string;
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento: string; 
}

// Represents the initial, potentially less detailed, user object from GET /api/usuarios/{id}
interface BaseUserResponse { 
  id_usuario: string;
  email: string;
  activo: boolean;
  persona: PersonaDetails;
  // IDs or minimal info for related entities, to determine type and fetch more if needed
  id_psicologo?: string | null; 
  id_paciente?: string | null;
  // Alternatively, type could be determined by perfiles if API sends them
  perfiles?: { id_perfil: number; nombre: string }[]; 
}


// This will be the structure of our form data
interface UserFormData {
  email: string;
  activo: boolean;
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento: string;
  tipoUsuario: 'general' | 'psicologo' | 'paciente' | '';
  // Psicologo specific
  numeroLicencia: string;
  especialidad: string;
  // Paciente specific is handled by selectedObraSocialId separately
}

interface ModuloConfig {
  id: string;
  nombre: string;
  descripcion: string;
  icon: any;
  ruta: string;
  permisosRequeridos: string[];
}

const MODULOS_DISPONIBLES: ModuloConfig[] = [
  { id: 'usuarios', nombre: 'Usuarios', descripcion: 'Gestión de usuarios', icon: Users, ruta: '/usuarios', permisosRequeridos: ['Ver Usuarios', 'Registrar Usuario', 'Editar Usuario', 'Eliminar Usuario']},
  { id: 'sesiones', nombre: 'Sesiones', descripcion: 'Administración de sesiones', icon: Calendar, ruta: '/sesiones', permisosRequeridos: ['Ver Sesiones', 'Registrar Sesión', 'Editar Sesión', 'Eliminar Sesión', 'Asignar Profesional']},
  { id: 'perfiles', nombre: 'Perfiles', descripcion: 'Administración de perfiles', icon: Shield, ruta: '/perfiles', permisosRequeridos: ['Ver Perfiles', 'Registrar Perfil', 'Editar Perfil', 'Eliminar Perfil', 'Asignar Perfil']},
  { id: 'informes', nombre: 'Informes', descripcion: 'Generación de reportes', icon: FileText, ruta: '/informes', permisosRequeridos: ['Ver Informes', 'Registrar Informe', 'Editar Informe', 'Eliminar Informe']}
];

interface FieldErrors {
  email?: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  fecha_nacimiento?: string;
  tipoUsuario?: string;
  numeroLicencia?: string; // Updated from matricula_profesional
  especialidad?: string;
  selectedObraSocialId?: string;
}

export default function EditarUsuarioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    activo: true,
    nombre: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    tipoUsuario: '',
    numeroLicencia: '', // Updated
    especialidad: '',   // Added
  });

  // State for Obras Sociales select
  const [obrasSocialesList, setObrasSocialesList] = useState<ObraSocial[]>([]);
  const [selectedObraSocialId, setSelectedObraSocialId] = useState<string | null>(null);
  const [isLoadingObrasSociales, setIsLoadingObrasSociales] = useState(false);
  const [errorObrasSociales, setErrorObrasSociales] = useState<string | null>(null);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modulosPermitidos, setModulosPermitidos] = useState<ModuloConfig[]>([]);
  const [userActionPermissions, setUserActionPermissions] = useState({ canEdit: false });

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session?.user?.permisos) {
      const userPermissions = session.user.permisos.map((p: any) => p.nombre);
      const canEditUsers = userPermissions.includes('Editar Usuario');
      setUserActionPermissions({ canEdit: canEditUsers });

      if (!canEditUsers) {
        setError("No tienes permiso para editar usuarios.");
        setIsLoadingData(false); // Stop loading as we can't proceed
      }
      
      const filteredMainModules = MODULOS_DISPONIBLES.filter(m => m.permisosRequeridos.some(pr => userPermissions.includes(pr)));
      setModulosPermitidos(filteredMainModules);
    } else if (status === 'authenticated' && !session?.user?.permisos) {
      setError("No se pudieron verificar los permisos.");
      setIsLoadingData(false);
    }
  }, [session, status, router]);

  useEffect(() => {
    if (!userId || !userActionPermissions.canEdit) {
      if(userActionPermissions.canEdit === false && status === 'authenticated' && !isLoadingData) {
      } else if (!userId && status === 'authenticated') {
        setError("No se proporcionó ID de usuario.");
        setIsLoadingData(false);
      }
      return;
    }

    async function fetchAllUserData() {
      try {
        setIsLoadingData(true);
        setError(null);

        // Step 1: Fetch base user data
        const userResponse = await fetch(`/api/usuarios/${userId}`);
        if (!userResponse.ok) {
          throw new Error(`Error ${userResponse.status}: No se pudo cargar el usuario base.`);
        }
        const baseUserData: BaseUserResponse = await userResponse.json();

        let determinedTipoUsuario: UserFormData['tipoUsuario'] = 'general';
        // Determine type: by specific ID presence or by perfiles
        // This example prioritizes specific IDs if available from /api/usuarios/{id}
        if (baseUserData.id_psicologo) {
            determinedTipoUsuario = 'psicologo';
        } else if (baseUserData.id_paciente) {
            determinedTipoUsuario = 'paciente';
        } else if (baseUserData.perfiles && baseUserData.perfiles.some(p => p.nombre === 'ROLE_PSICOLOGO')) {
            determinedTipoUsuario = 'psicologo';
        } else if (baseUserData.perfiles && baseUserData.perfiles.some(p => p.nombre === 'ROLE_PACIENTE')) {
            determinedTipoUsuario = 'paciente';
        }
        
        let psicologoData: Partial<PsicologoDetails> = {};
        let pacienteData: Partial<PacienteDetails & { obraSocialIdFromPacienteEndpoint: string | null }> = {};

        // Step 2: Fetch role-specific data if applicable
        if (determinedTipoUsuario === 'psicologo') {
          // If id_psicologo is not directly on baseUserData, one might need another call to get it via personaId
          // For now, assume id_psicologo is available or can be derived if type is psicologo.
          // If the main /api/usuarios/{id} ALREADY returns full psicologo details, this fetch is redundant.
          // This code assumes it might NOT, and provides a path for fetching separately.
          const psicologoIdToFetch = baseUserData.id_psicologo; // Or derive if not directly available
          if (psicologoIdToFetch) { // Only fetch if we have an ID
            const psicologoResponse = await fetch(`/api/psicologos/${psicologoIdToFetch}`);
            if (psicologoResponse.ok) {
              const pData: PsicologoDetails = await psicologoResponse.json();
              psicologoData = { numeroLicencia: pData.numeroLicencia, especialidad: pData.especialidad };
            } else {
              console.warn(`No se pudieron cargar los detalles del psicólogo (ID: ${psicologoIdToFetch}).`);
            }
          }
        } else if (determinedTipoUsuario === 'paciente') {
          const pacienteIdToFetch = baseUserData.id_paciente; // Or derive
          if (pacienteIdToFetch) { // Only fetch if we have an ID
            const pacienteResponse = await fetch(`/api/pacientes/${pacienteIdToFetch}`);
            if (pacienteResponse.ok) {
              const paData: PacienteDetails = await pacienteResponse.json();
              // Assuming PacienteDetails from /api/pacientes/{id} returns id_obra_social directly
              pacienteData = { obraSocialIdFromPacienteEndpoint: paData.id_obra_social?.toString() || null };
            } else {
              console.warn(`No se pudieron cargar los detalles del paciente (ID: ${pacienteIdToFetch}).`);
            }
          }
        }
        
        setFormData({
          email: baseUserData.email,
          activo: baseUserData.activo,
          nombre: baseUserData.persona.nombre,
          apellido: baseUserData.persona.apellido,
          dni: baseUserData.persona.dni,
          fecha_nacimiento: baseUserData.persona.fecha_nacimiento ? baseUserData.persona.fecha_nacimiento.split('T')[0] : '',
          tipoUsuario: determinedTipoUsuario,
          numeroLicencia: psicologoData.numeroLicencia || '',
          especialidad: psicologoData.especialidad || '',
        });

        if (determinedTipoUsuario === 'paciente' && pacienteData.obraSocialIdFromPacienteEndpoint) {
            setSelectedObraSocialId(pacienteData.obraSocialIdFromPacienteEndpoint);
        }

      } catch (err: any) {
        console.error("Error fetching user data:", err);
        setError(err.message || 'Error al cargar datos del usuario.');
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchAllUserData();

    // Fetch Obras Sociales for the select dropdown (this can run in parallel or after type is known)
    setIsLoadingObrasSociales(true);
    fetch('/api/obras-sociales')
      .then(res => {
        if (!res.ok) throw new Error('No se pudieron cargar las obras sociales.');
        return res.json();
      })
      .then(data => setObrasSocialesList(data))
      .catch(err => setErrorObrasSociales(err.message))
      .finally(() => setIsLoadingObrasSociales(false));

  }, [userId, userActionPermissions.canEdit, status]);


  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTipoUsuarioSelectChange = (value: string) => {
    const newTipoUsuario = value as UserFormData['tipoUsuario'];
    setFormData(prev => ({
      ...prev,
      tipoUsuario: newTipoUsuario,
      // Reset fields specific to other types
      numeroLicencia: newTipoUsuario === 'psicologo' ? prev.numeroLicencia : '',
      especialidad: newTipoUsuario === 'psicologo' ? prev.especialidad : '',
    }));
    if (newTipoUsuario !== 'paciente') {
      setSelectedObraSocialId(null);
    }
    // Clear potential errors for fields that might disappear
    const newFieldErrors = {...fieldErrors};
    delete newFieldErrors.numeroLicencia;
    delete newFieldErrors.especialidad;
    delete newFieldErrors.selectedObraSocialId;
    setFieldErrors(newFieldErrors);
  };

  const handleObraSocialSelectChange = (value: string) => {
    setSelectedObraSocialId(value);
     if (fieldErrors.selectedObraSocialId) {
      setFieldErrors(prev => ({ ...prev, selectedObraSocialId: undefined }));
    }
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, activo: checked }));
  };

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};
    if (!formData.email.trim()) newErrors.email = "El email es requerido.";
    // Email format validation can be added here if needed
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido.";
    if (!formData.apellido.trim()) newErrors.apellido = "El apellido es requerido.";
    if (!formData.dni.trim()) newErrors.dni = "El DNI es requerido.";
    else if (!/^\d{7,8}$/.test(formData.dni)) newErrors.dni = "DNI inválido (7-8 dígitos numéricos).";
    if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = "Fecha de nacimiento requerida.";
    if (!formData.tipoUsuario) newErrors.tipoUsuario = "Tipo de usuario requerido.";

    if (formData.tipoUsuario === 'psicologo') {
      if (!formData.numeroLicencia?.trim()) newErrors.numeroLicencia = "Número de licencia es requerido.";
      if (!formData.especialidad?.trim()) newErrors.especialidad = "Especialidad es requerida.";
    } else if (formData.tipoUsuario === 'paciente') {
      if (!selectedObraSocialId) newErrors.selectedObraSocialId = "Obra Social es requerida para pacientes.";
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    const payload: any = {
      // id_usuario: userId, // Not usually needed in payload, but good to have for clarity
      email: formData.email, // Assuming email is not editable based on UI, but send it if API expects it
      activo: formData.activo,
      persona: {
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        fecha_nacimiento: formData.fecha_nacimiento,
      }
    };

    if (formData.tipoUsuario === 'psicologo') {
      payload.psicologo = {
        especialidad: formData.especialidad,
        numeroLicencia: formData.numeroLicencia,
      };
      payload.paciente = null; // Ensure other type-specific data is nulled if type changes
    } else if (formData.tipoUsuario === 'paciente') {
      payload.paciente = {
        idObraSocial: selectedObraSocialId ? parseInt(selectedObraSocialId) : null, // Ensure API expects number
      };
      payload.psicologo = null;
    } else { // general user
        payload.psicologo = null;
        payload.paciente = null;
    }
    
    // console.log("Payload to send:", payload);

    try {
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'PATCH', // Or PUT, depending on API design
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el usuario.');
      }
      // TODO: Show success toast
      alert('Usuario actualizado exitosamente!');
      router.push('/usuarios/listar');
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err.message);
      // Handle field-specific errors from backend if available: setFieldErrors(err.errors)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => await signOut({ redirect: true, callbackUrl: '/login' });
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const navigateToModule = (ruta: string) => { router.push(ruta); setIsMenuOpen(false); };
  
  const pageTitle = formData.nombre ? `Editar Usuario: ${formData.nombre} ${formData.apellido}` : "Editar Usuario";
  const currentUserName = session?.user?.persona ? `${session.user.persona.nombre} ${session.user.persona.apellido}` : session?.user?.email || 'Usuario';


  if (isLoadingData && status !== 'loading') { // Show loading if actively fetching data post-permission check
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#152A2A' }}>
        <div className="text-white text-lg">Cargando datos del usuario...</div>
      </div>
    );
  }
  
  if (!userActionPermissions.canEdit && !isLoadingData) { // Handles explicit "no permission"
     return (
      <div className="min-h-screen" style={{ backgroundColor: '#152A2A' }}>
        <nav className="w-full p-4" style={{ backgroundColor: '#1D3434' }}><div className="flex items-center justify-between"><div className="flex items-center space-x-4"><div className="w-10 h-10"><MemopsyLogo /></div><h1 className="text-xl font-bold" style={{ color: '#F1C77A' }}>MemoPsy</h1></div></div></nav>
        <main className="container mx-auto px-4 py-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-6 text-red-500" />
          <h1 className="text-3xl font-bold text-red-500 mb-4">Acceso Denegado</h1>
          <p className="text-gray-300 mb-6">{error || "No tienes permiso para editar este usuario."}</p>
          <Button onClick={() => router.push('/usuarios/listar')} style={{ backgroundColor: '#F1C77A', color: '#1D3434' }}>Volver a la Lista</Button>
        </main>
      </div>
    );
  }

  if (error && !isLoadingData && !formData.nombre) { // If error stopped data load entirely
     return (
      <div className="min-h-screen" style={{ backgroundColor: '#152A2A' }}>
        <nav className="w-full p-4" style={{ backgroundColor: '#1D3434' }}><div className="flex items-center justify-between"><div className="flex items-center space-x-4"><div className="w-10 h-10"><MemopsyLogo /></div><h1 className="text-xl font-bold" style={{ color: '#F1C77A' }}>MemoPsy</h1></div></div></nav>
        <main className="container mx-auto px-4 py-8 text-center">
           <AlertCircle className="w-16 h-16 mx-auto mb-6 text-red-500" />
          <h1 className="text-3xl font-bold text-red-500 mb-4">Error al Cargar Usuario</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button onClick={() => router.push('/usuarios/listar')} style={{ backgroundColor: '#F1C77A', color: '#1D3434' }}>Volver a la Lista</Button>
        </main>
      </div>
    );
  }


  return (
    <div className="min-h-screen" style={{ backgroundColor: '#152A2A' }}>
      {/* Navigation Bar */}
      <nav className="w-full p-4" style={{ backgroundColor: '#1D3434' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4"><div className="w-10 h-10"><MemopsyLogo /></div><h1 className="text-xl font-bold" style={{ color: '#F1C77A' }}>MemoPsy</h1></div>
          <button onClick={toggleMenu} className="p-2 rounded-lg" style={{ backgroundColor: '#152A2A' }}>{isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}</button>
        </div>
        {isMenuOpen && (
          <div className="absolute top-16 right-4 w-64 rounded-lg shadow-lg z-50" style={{ backgroundColor: '#1D3434' }}>
            <div className="p-4 border-b border-gray-600"><p className="text-sm text-gray-300">Conectado como:</p><p className="font-semibold text-white">{session?.user?.email}</p><p className="text-sm" style={{ color: '#F1C77A' }}>{currentUserName}</p></div>
            <div className="p-2"><h3 className="px-2 py-1 text-sm font-semibold text-gray-300 uppercase tracking-wide">Módulos</h3>
              {modulosPermitidos.map(m => <button key={m.id} onClick={() => navigateToModule(m.ruta)} className="w-full flex items-center px-2 py-2 text-left text-white hover:bg-opacity-80 rounded-lg transition-colors" style={{backgroundColor: 'transparent'}} onMouseEnter={e=>(e.target as HTMLElement).style.backgroundColor='#152A2A'} onMouseLeave={e=>(e.target as HTMLElement).style.backgroundColor='transparent'}><m.icon className="w-5 h-5 mr-3" /> {m.nombre}</button>)}</div>
            <div className="p-2 border-t border-gray-600"><button
              onClick={() => {
                router.push("/welcome");
              }}
              className="w-full flex items-center px-2 py-2 text-left text-white hover:bg-opacity-80 rounded-lg transition-colors"
              style={{ backgroundColor: "transparent" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.backgroundColor = "#152A2A")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.backgroundColor = "transparent")}
              >
              <HomeIcon className="w-5 h-5 mr-3" />
              Home
              </button><button onClick={handleLogout} className="w-full flex items-center px-2 py-2 text-left text-red-400 hover:bg-red-900 hover:bg-opacity-20 rounded-lg transition-colors"><LogOut className="w-5 h-5 mr-3" /> Cerrar Sesión</button></div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto" style={{ backgroundColor: '#1D3434', borderColor: '#2A4A4A' }}>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold" style={{ color: '#F1C77A' }}>{pageTitle}</CardTitle>
            <CardDescription className="text-gray-300">
              Actualice los datos del usuario. El email no puede ser modificado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingData && userActionPermissions.canEdit ? (
                 <div className="text-center text-gray-300 py-10">Cargando datos del usuario...</div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="nombre" className="text-gray-200">Nombre</Label><Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className="bg-gray-700 mt-1"/>{fieldErrors.nombre && <p className="text-red-500 text-xs mt-1">{fieldErrors.nombre}</p>}</div>
                <div><Label htmlFor="apellido" className="text-gray-200">Apellido</Label><Input id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} className="bg-gray-700 mt-1"/>{fieldErrors.apellido && <p className="text-red-500 text-xs mt-1">{fieldErrors.apellido}</p>}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="dni" className="text-gray-200">DNI</Label><Input id="dni" name="dni" value={formData.dni} onChange={handleChange} className="bg-gray-700 mt-1"/>{fieldErrors.dni && <p className="text-red-500 text-xs mt-1">{fieldErrors.dni}</p>}</div>
                <div><Label htmlFor="fecha_nacimiento" className="text-gray-200">Fecha de Nacimiento</Label><Input id="fecha_nacimiento" name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleChange} className="bg-gray-700 mt-1" style={{ colorScheme: 'dark' }}/>{fieldErrors.fecha_nacimiento && <p className="text-red-500 text-xs mt-1">{fieldErrors.fecha_nacimiento}</p>}</div>
              </div>
              
              {/* Account Info */}
              <div><Label htmlFor="email" className="text-gray-200">Email (No editable)</Label><Input id="email" name="email" type="email" value={formData.email} readOnly className="bg-gray-800 mt-1 text-gray-400"/></div>
              
              <div className="flex items-center space-x-3">
                <Switch id="activo" checked={formData.activo} onCheckedChange={handleSwitchChange} className="data-[state=checked]:bg-teal-600 data-[state=unchecked]:bg-gray-600"/>
                <Label htmlFor="activo" className="text-gray-200">Usuario {formData.activo ? 'Activo' : 'Inactivo'}</Label>
              </div>

              {/* User Type Specific */}
              <div>
                <Label htmlFor="tipoUsuario" className="text-gray-200">Tipo de Usuario</Label>
                <Select name="tipoUsuario" value={formData.tipoUsuario} onValueChange={handleTipoUsuarioSelectChange}>
                  <SelectTrigger className="bg-gray-700 mt-1"><SelectValue placeholder="Seleccione un tipo..." /></SelectTrigger>
                  <SelectContent style={{ backgroundColor: '#1D3434', borderColor: '#2A4A4A' }}>
                    <SelectItem value="general" className="text-gray-200 hover:!bg-gray-600 focus:!bg-gray-600"><UserCircle className="w-4 h-4 mr-2 inline-block" />Usuario General</SelectItem>
                    <SelectItem value="psicologo" className="text-gray-200 hover:!bg-gray-600 focus:!bg-gray-600"><Briefcase className="w-4 h-4 mr-2 inline-block" />Psicólogo</SelectItem>
                    <SelectItem value="paciente" className="text-gray-200 hover:!bg-gray-600 focus:!bg-gray-600"><Activity className="w-4 h-4 mr-2 inline-block" />Paciente</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.tipoUsuario && <p className="text-red-500 text-xs mt-1">{fieldErrors.tipoUsuario}</p>}
              </div>

              {formData.tipoUsuario === 'psicologo' && (
                <>
                  <div>
                    <Label htmlFor="numeroLicencia" className="text-gray-200">Número de Licencia</Label>
                    <Input id="numeroLicencia" name="numeroLicencia" value={formData.numeroLicencia} onChange={handleChange} className="bg-gray-700 mt-1"/>
                    {fieldErrors.numeroLicencia && <p className="text-red-500 text-xs mt-1">{fieldErrors.numeroLicencia}</p>}
                  </div>
                  <div>
                    <Label htmlFor="especialidad" className="text-gray-200">Especialidad</Label>
                    <Input id="especialidad" name="especialidad" value={formData.especialidad} onChange={handleChange} className="bg-gray-700 mt-1"/>
                    {fieldErrors.especialidad && <p className="text-red-500 text-xs mt-1">{fieldErrors.especialidad}</p>}
                  </div>
                </>
              )}

              {formData.tipoUsuario === 'paciente' && (
                <div>
                  <Label htmlFor="selectedObraSocialId" className="text-gray-200">Obra Social</Label>
                  <Select name="selectedObraSocialId" value={selectedObraSocialId || ''} onValueChange={handleObraSocialSelectChange}>
                    <SelectTrigger className="bg-gray-700 mt-1">
                      <SelectValue placeholder={isLoadingObrasSociales ? "Cargando..." : "Seleccione Obra Social"} />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: '#1D3434', borderColor: '#2A4A4A' }}>
                      {isLoadingObrasSociales ? (
                        <SelectItem value="loading" disabled className="text-gray-400">Cargando...</SelectItem>
                      ) : errorObrasSociales ? (
                        <SelectItem value="error" disabled className="text-red-400">{errorObrasSociales}</SelectItem>
                      ) : obrasSocialesList.length === 0 ? (
                        <SelectItem value="no-options" disabled className="text-gray-400">No hay obras sociales</SelectItem>
                      ) : (
                        obrasSocialesList.map(obra => (
                          <SelectItem key={obra.id_obra_social} value={obra.id_obra_social.toString()} className="text-gray-200 hover:!bg-gray-600 focus:!bg-gray-600">
                            {obra.nombre}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {fieldErrors.selectedObraSocialId && <p className="text-red-500 text-xs mt-1">{fieldErrors.selectedObraSocialId}</p>}
                </div>
              )}
              
              {error && Object.keys(fieldErrors).length === 0 && <p className="text-red-500 text-sm text-center bg-red-900 bg-opacity-30 p-3 rounded-md">{error}</p>}
              
              <CardFooter className="flex justify-end pt-6">
                <Button type="button" variant="outline" onClick={() => router.push('/usuarios/listar')} className="mr-3 text-gray-300 border-gray-600 hover:bg-gray-700">Cancelar</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 text-white">
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </CardFooter>
            </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
