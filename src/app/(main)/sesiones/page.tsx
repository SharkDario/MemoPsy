"use client"

import { useState, useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import MemopsyLogo from "@/app/components/MemopsyLogo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import {
  Menu,
  X,
  CalendarIcon,
  Plus,
  Users,
  User,
  Brain,
  HomeIcon,
  Shield,
  LogOut,
  Clock,
  MapPin,
  Activity,
  Check,
    FileText, // Existing
    Pencil, // Add this
} from "lucide-react"
import { format, parseISO, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface Sesion {
  id: string
  fechaHoraInicio: string
  fechaHoraFin: string
  psicologo?: {
    id: string
    persona: {
      nombre: string
      apellido: string
    }
  }
  modalidad?: {
    id: string
    nombre: string
  }
  estado?: {
    id: string
    nombre: string
  }
  pacientes?: Array<{
    id: string
    persona: {
      nombre: string
      apellido: string
    }
  }>
}

interface Psicologo {
  id: string
  persona: {
    nombre: string
    apellido: string
    nombreCompleto: string
  }
}

interface Paciente {
  id: string
  persona: {
    nombre: string
    apellido: string
    nombreCompleto: string
  }
}

interface ModuloConfig {
  id: string
  nombre: string
  descripcion: string
  icon: any
  ruta: string
  permisosRequeridos: string[]
}

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
    descripcion: "Generación de reportes",
    icon: FileText,
    ruta: "/informes",
    permisosRequeridos: ["Ver Informes", "Registrar Informe", "Editar Informe", "Eliminar Informe"],
  },
]

export default function SesionesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [modulosPermitidos, setModulosPermitidos] = useState<ModuloConfig[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [psicologos, setPsicologos] = useState<Psicologo[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [modalidades, setModalidades] = useState<any[]>([])
  const [estados, setEstados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Búsqueda de psicólogos y pacientes
  const [psicologoSearch, setPsicologoSearch] = useState("")
  const [pacienteSearch, setPacienteSearch] = useState("")
  const [psicologoSearchResults, setPsicologoSearchResults] = useState<Psicologo[]>([])
  const [pacienteSearchResults, setPacienteSearchResults] = useState<Paciente[]>([])
  const [isPsicologoPopoverOpen, setIsPsicologoPopoverOpen] = useState(false)
  const [isPacientePopoverOpen, setIsPacientePopoverOpen] = useState(false)
  const [selectedPacientes, setSelectedPacientes] = useState<Paciente[]>([])

  // Permisos del usuario
  const [permisos, setPermisos] = useState<string[]>([])

  // Form state
  const [formData, setFormData] = useState({
    fechaInicio: format(new Date(), "yyyy-MM-dd"),
    horaInicio: "09:00",
    fechaFin: format(new Date(), "yyyy-MM-dd"),
    horaFin: "10:00",
    psicologoId: "",
    modalidadId: "",
    estadoId: "",
    pacientesIds: [] as string[],
  })

  const [editingSesion, setEditingSesion] = useState<Sesion | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
      id: "", // To store the ID of the session being edited
      fechaInicio: "",
      horaInicio: "",
      fechaFin: "",
      horaFin: "",
      psicologoId: "",
      modalidadId: "",
      estadoId: "",
      pacientesIds: [] as string[],
  });
  const [editPsicologoSearchResults, setEditPsicologoSearchResults] = useState<Psicologo[]>([]);
  const [editPacienteSearchResults, setEditPacienteSearchResults] = useState<Paciente[]>([]);
  const [isEditPsicologoPopoverOpen, setIsEditPsicologoPopoverOpen] = useState(false);
  const [isEditPacientePopoverOpen, setIsEditPacientePopoverOpen] = useState(false);
  const [editSelectedPacientes, setEditSelectedPacientes] = useState<Paciente[]>([]);
  const [editPsicologoSearch, setEditPsicologoSearch] = useState("");
  const [editPacienteSearch, setEditPacienteSearch] = useState("");
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // Refs para debounce
  const psicologoSearchTimeout = useRef<NodeJS.Timeout | null>(null)
  const pacienteSearchTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleOpenEditDialog = (sesion: Sesion) => {
    setEditingSesion(sesion); // Keep a reference to the original session object
    setEditFormData({
        id: sesion.id,
        fechaInicio: format(parseISO(sesion.fechaHoraInicio), "yyyy-MM-dd"),
        horaInicio: format(parseISO(sesion.fechaHoraInicio), "HH:mm"),
        fechaFin: format(parseISO(sesion.fechaHoraFin), "yyyy-MM-dd"),
        horaFin: format(parseISO(sesion.fechaHoraFin), "HH:mm"),
        psicologoId: sesion.psicologo?.id || "",
        modalidadId: sesion.modalidad?.id || "",
        estadoId: sesion.estado?.id || "",
        pacientesIds: sesion.pacientes?.map(p => p.id) || [],
    });
    setEditPsicologoSearch(sesion.psicologo ? `${sesion.psicologo.persona.nombre} ${sesion.psicologo.persona.apellido}` : "");
    const initialPacientes = sesion.pacientes?.map(p => ({
        id: p.id,
        persona: {
            nombre: p.persona.nombre,
            apellido: p.persona.apellido,
            nombreCompleto: `${p.persona.nombre} ${p.persona.apellido}`
        }
    })) || [];
    setEditSelectedPacientes(initialPacientes);
    setEditPacienteSearch("");
    setEditFormErrors({});
    setIsEditPsicologoPopoverOpen(false);
    setIsEditPacientePopoverOpen(false);
    setEditPsicologoSearchResults([]); 
    setEditPacienteSearchResults([]);
    setIsEditDialogOpen(true);
};

const handleSelectEditPsicologo = (psicologo: Psicologo) => {
    setEditFormData({ ...editFormData, psicologoId: psicologo.id });
    setIsEditPsicologoPopoverOpen(false);
    setEditPsicologoSearch(psicologo.persona.nombreCompleto);
    setEditPsicologoSearchResults([]); 
};

const handleSelectEditPaciente = (paciente: Paciente) => {
    if (!editSelectedPacientes.some(p => p.id === paciente.id)) {
        const newSelectedPacientes = [...editSelectedPacientes, paciente];
        setEditSelectedPacientes(newSelectedPacientes);
        setEditFormData({ ...editFormData, pacientesIds: newSelectedPacientes.map(p => p.id) });
    }
    setEditPacienteSearch(""); 
    setIsEditPacientePopoverOpen(false); 
    setEditPacienteSearchResults([]); 
};

const handleRemoveEditPaciente = (pacienteId: string) => {
    const newSelectedPacientes = editSelectedPacientes.filter(p => p.id !== pacienteId);
    setEditSelectedPacientes(newSelectedPacientes);
    setEditFormData({ ...editFormData, pacientesIds: newSelectedPacientes.map(p => p.id) });
};

const validateEditForm = () => {
    const errors: Record<string, string> = {};
    if (!editFormData.fechaInicio) errors.fechaInicio = "La fecha de inicio es requerida";
    if (!editFormData.horaInicio) errors.horaInicio = "La hora de inicio es requerida";
    if (!editFormData.fechaFin) errors.fechaFin = "La fecha de fin es requerida";
    if (!editFormData.horaFin) errors.horaFin = "La hora de fin es requerida";
    if (!editFormData.psicologoId) errors.psicologoId = "El psicólogo es requerido";
    if (!editFormData.modalidadId) errors.modalidadId = "La modalidad es requerida";
    if (!editFormData.estadoId) errors.estadoId = "El estado es requerido";
    if (!editFormData.pacientesIds || editFormData.pacientesIds.length === 0) errors.pacientesIds = "Debe seleccionar al menos un paciente";
    
    const startDateTimeStr = `${editFormData.fechaInicio}T${editFormData.horaInicio}`;
    const endDateTimeStr = `${editFormData.fechaFin}T${editFormData.horaFin}`;
    if (editFormData.fechaInicio && editFormData.horaInicio && editFormData.fechaFin && editFormData.horaFin) {
        if (new Date(startDateTimeStr) >= new Date(endDateTimeStr)) {
            errors.fechaFin = "La fecha/hora de fin debe ser posterior"; 
            errors.horaFin = "a la fecha/hora de inicio"; 
        }
    }

    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
};

const handleUpdateSesion = async () => {
    if (!validateEditForm() || !editingSesion) return;
    setEditFormErrors({}); 

    try {
        setIsEditSubmitting(true);
        const fechaHoraInicio = new Date(`${editFormData.fechaInicio}T${editFormData.horaInicio}`);
        const fechaHoraFin = new Date(`${editFormData.fechaFin}T${editFormData.horaFin}`);

        const payload = {
            fechaHoraInicio: fechaHoraInicio.toISOString(),
            fechaHoraFin: fechaHoraFin.toISOString(),
            psicologoId: parseInt(editFormData.psicologoId),
            modalidadId: parseInt(editFormData.modalidadId),
            estadoId: parseInt(editFormData.estadoId),
            pacientesIds: editFormData.pacientesIds,
        };
        
        const response = await fetch(`/api/sesiones/${editingSesion.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            setIsEditDialogOpen(false);
            await loadInitialData(); 
            setEditingSesion(null); 
            alert("Sesión actualizada exitosamente."); 
        } else {
            const errorData = await response.json();
            const newErrors: Record<string, string> = {};
            let alertMessage = "Error al actualizar la sesión.";

            if (errorData.details && Array.isArray(errorData.details)) {
                let generalErrorMessages: string[] = [];
                errorData.details.forEach((detail: any) => {
                    if (detail.path && detail.path.length > 0) {
                        newErrors[detail.path[0]] = detail.message;
                    } else if (detail.message) {
                        generalErrorMessages.push(detail.message);
                    }
                });
                if (generalErrorMessages.length > 0) {
                    newErrors.general = generalErrorMessages.join(' ');
                    alertMessage = `${alertMessage} ${newErrors.general}`;
                }
            } else if (errorData.error) {
                newErrors.general = errorData.error; 
                alertMessage = errorData.error;
            } else {
                newErrors.general = "Ocurrió un error desconocido.";
            }
            setEditFormErrors(newErrors);
            alert(alertMessage);
        }
    } catch (error) {
        console.error("Error updating session:", error);
        setEditFormErrors({ general: "Error de conexión o del cliente." });
        alert("Error al actualizar la sesión. Verifique su conexión e intente nuevamente.");
    } finally {
        setIsEditSubmitting(false);
    }
};

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.permisos) {
      const userPermissions = session.user.permisos.map((p: any) => p.nombre)
      setPermisos(userPermissions)

      const filteredMainModules = MODULOS_DISPONIBLES.filter((module) =>
        module.permisosRequeridos.some((pr) => userPermissions.includes(pr)),
      )
      setModulosPermitidos(filteredMainModules)
    }
  }, [session])

  useEffect(() => {
    if (session?.user) {
      loadInitialData()
    }
  }, [session])

  // Efecto para búsqueda de psicólogos con debounce
  useEffect(() => {
    if (psicologoSearchTimeout.current) {
      clearTimeout(psicologoSearchTimeout.current)
    }

    if (psicologoSearch.trim().length > 1) {
      psicologoSearchTimeout.current = setTimeout(() => {
        searchPsicologos(psicologoSearch, setPsicologoSearchResults); 
      }, 300)
    } else {
        setPsicologoSearchResults([]); 
    }

    return () => {
      if (psicologoSearchTimeout.current) {
        clearTimeout(psicologoSearchTimeout.current)
      }
    }
  }, [psicologoSearch])

  // Efecto para búsqueda de pacientes con debounce
  useEffect(() => {
    if (pacienteSearchTimeout.current) {
      clearTimeout(pacienteSearchTimeout.current)
    }

    if (pacienteSearch.trim().length > 1) {
      pacienteSearchTimeout.current = setTimeout(() => {
        searchPacientes(pacienteSearch, setPacienteSearchResults); 
      }, 300)
    } else {
        setPacienteSearchResults([]); 
    }

    return () => {
      if (pacienteSearchTimeout.current) {
        clearTimeout(pacienteSearchTimeout.current)
      }
    }
  }, [pacienteSearch])

  const editPsicologoSearchTimeout = useRef<NodeJS.Timeout | null>(null);
  const editPacienteSearchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
      if (editPsicologoSearchTimeout.current) {
          clearTimeout(editPsicologoSearchTimeout.current);
      }
      if (editPsicologoSearch.trim().length > 1 && isEditDialogOpen) {
          editPsicologoSearchTimeout.current = setTimeout(() => {
              searchPsicologos(editPsicologoSearch, setEditPsicologoSearchResults);
          }, 300);
      } else if (isEditDialogOpen) { // Important: only clear if dialog is open
          setEditPsicologoSearchResults([]);
      }
      return () => {
          if (editPsicologoSearchTimeout.current) {
              clearTimeout(editPsicologoSearchTimeout.current);
          }
      };
  }, [editPsicologoSearch, isEditDialogOpen]);

  useEffect(() => {
      if (editPacienteSearchTimeout.current) {
          clearTimeout(editPacienteSearchTimeout.current);
      }
      if (editPacienteSearch.trim().length > 1 && isEditDialogOpen) {
          editPacienteSearchTimeout.current = setTimeout(() => {
              searchPacientes(editPacienteSearch, setEditPacienteSearchResults);
          }, 300);
      } else if (isEditDialogOpen) { // Important: only clear if dialog is open
          setEditPacienteSearchResults([]);
      }
      return () => {
          if (editPacienteSearchTimeout.current) {
              clearTimeout(editPacienteSearchTimeout.current);
          }
      };
  }, [editPacienteSearch, isEditDialogOpen]);
  
  // Agregar este useEffect después de los otros useEffect existentes
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (
          !target.closest("#create-psicologo-popover-wrapper") &&
          !target.closest("#create-paciente-popover-wrapper") &&
          !target.closest("#edit-psicologo-popover-wrapper") &&
          !target.closest("#edit-paciente-popover-wrapper")
      ) {
          setIsPsicologoPopoverOpen(false);
          setIsPacientePopoverOpen(false);
          setIsEditPsicologoPopoverOpen(false);
          setIsEditPacientePopoverOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)

      // Cargar sesiones
      const sesionesResponse = await fetch("/api/sesiones")
      if (sesionesResponse.ok) {
        const sesionesData = await sesionesResponse.json()
        setSesiones(sesionesData)

        // Si hay sesiones para hoy, mantener la fecha actual seleccionada
        // Si no, buscar la primera sesión disponible y seleccionar esa fecha
        const today = new Date()
        const sesionesHoy = sesionesData.filter((sesion) => isSameDay(parseISO(sesion.fechaHoraInicio), today))

        if (sesionesHoy.length === 0 && sesionesData.length > 0) {
          // Ordenar sesiones por fecha
          const sesionesOrdenadas = [...sesionesData].sort(
            (a, b) => new Date(a.fechaHoraInicio).getTime() - new Date(b.fechaHoraInicio).getTime(),
          )

          // Encontrar la primera sesión futura
          const sesionFutura = sesionesOrdenadas.find((sesion) => new Date(sesion.fechaHoraInicio) >= today)

          if (sesionFutura) {
            setSelectedDate(parseISO(sesionFutura.fechaHoraInicio))
          }
        }
      }

      // Cargar datos para formularios
      const [modalidadesRes, estadosRes] = await Promise.all([fetch("/api/modalidades"), fetch("/api/estados")])

      if (modalidadesRes.ok) {
        const modalidadesData = await modalidadesRes.json()
        setModalidades(modalidadesData)
      }

      if (estadosRes.ok) {
        const estadosData = await estadosRes.json()
        setEstados(estadosData)
      }
    } catch (error) {
      console.error("Error loading initial data:", error)
    } finally {
      setLoading(false)
    }
  }

  const searchPsicologos = async (query: string, setSearchResults: React.Dispatch<React.SetStateAction<Psicologo[]>>) => {
    try {
      if (query.trim().length < 2) {
        setSearchResults([])
        return
      }

      const response = await fetch(`/api/psicologos/buscar?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error("Error searching psychologists:", error)
      setSearchResults([])
    }
  }

  const searchPacientes = async (query: string, setSearchResults: React.Dispatch<React.SetStateAction<Paciente[]>>) => {
    try {
      if (query.trim().length < 2) {
        setSearchResults([])
        return
      }

      const response = await fetch(`/api/pacientes/buscar?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error("Error searching patients:", error)
      setSearchResults([])
    }
  }

  const handleLogout = async () => {
    await signOut({
      redirect: true,
      callbackUrl: "/login",
    })
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navigateToModule = (ruta: string) => {
    router.push(ruta)
    setIsMenuOpen(false)
  }

  const handleSelectPsicologo = (psicologo: Psicologo) => {
    setFormData({
      ...formData,
      psicologoId: psicologo.id,
    })
    setIsPsicologoPopoverOpen(false)
    setPsicologoSearch(psicologo.persona.nombreCompleto)
  }

  const handleSelectPaciente = (paciente: Paciente) => {
    // Verificar si el paciente ya está seleccionado
    if (!selectedPacientes.some((p) => p.id === paciente.id)) {
      const newSelectedPacientes = [...selectedPacientes, paciente]
      setSelectedPacientes(newSelectedPacientes)
      setFormData({
        ...formData,
        pacientesIds: newSelectedPacientes.map((p) => p.id),
      })
    }
    setPacienteSearch("")
  }

  const handleRemovePaciente = (pacienteId: string) => {
    const newSelectedPacientes = selectedPacientes.filter((p) => p.id !== pacienteId)
    setSelectedPacientes(newSelectedPacientes)
    setFormData({
      ...formData,
      pacientesIds: newSelectedPacientes.map((p) => p.id),
    })
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.fechaInicio) errors.fechaInicio = "La fecha de inicio es requerida"
    if (!formData.horaInicio) errors.horaInicio = "La hora de inicio es requerida"
    if (!formData.fechaFin) errors.fechaFin = "La fecha de fin es requerida"
    if (!formData.horaFin) errors.horaFin = "La hora de fin es requerida"
    if (!formData.psicologoId) errors.psicologoId = "El psicólogo es requerido"
    if (!formData.modalidadId) errors.modalidadId = "La modalidad es requerida"
    if (!formData.estadoId) errors.estadoId = "El estado es requerido"
    if (formData.pacientesIds.length === 0) errors.pacientesIds = "Debe seleccionar al menos un paciente"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateSesion = async () => {
    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      const fechaHoraInicio = new Date(`${formData.fechaInicio}T${formData.horaInicio}`)
      const fechaHoraFin = new Date(`${formData.fechaFin}T${formData.horaFin}`)

      const response = await fetch("/api/sesiones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fechaHoraInicio: fechaHoraInicio.toISOString(),
          fechaHoraFin: fechaHoraFin.toISOString(),
          psicologoId: formData.psicologoId,
          modalidadId: formData.modalidadId,
          estadoId: formData.estadoId,
          pacientesIds: formData.pacientesIds,
        }),
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)

        // Set the selected date to the date of the new session
        setSelectedDate(fechaHoraInicio)

        // Reload data to include the new session
        await loadInitialData()

        // Reset form
        setFormData({
          fechaInicio: format(new Date(), "yyyy-MM-dd"),
          horaInicio: "09:00",
          fechaFin: format(new Date(), "yyyy-MM-dd"),
          horaFin: "10:00",
          psicologoId: "",
          modalidadId: "",
          estadoId: "",
          pacientesIds: [],
        })
        setSelectedPacientes([])
        setPsicologoSearch("")
        setPacienteSearch("")
      } else {
        const errorData = await response.json()
        if (errorData.details) {
          setFormErrors(errorData.details)
        } else {
          alert("Error al crear la sesión: " + errorData.error)
        }
      }
    } catch (error) {
      console.error("Error creating session:", error)
      alert("Error al crear la sesión. Por favor, intente nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSesionesForDate = (date: Date, filterType: "all" | "psicologo" | "paciente") => {
    return sesiones.filter((sesion) => {
      const sesionDate = parseISO(sesion.fechaHoraInicio)
      const isSameDate = isSameDay(sesionDate, date)

      if (!isSameDate) return false

      if (filterType === "psicologo") {
        // Solo mostrar sesiones donde el usuario es el psicólogo
        return sesion.psicologo?.id === session?.user?.psicologoId
      }

      if (filterType === "paciente") {
        // Solo mostrar sesiones donde el usuario es paciente
        return sesion.pacientes?.some((p) => p.id === session?.user?.pacienteId)
      }

      return true // 'all' - mostrar todas las sesiones (para administradores)
    })
  }

  const renderCalendarWithSessions = (filterType: "all" | "psicologo" | "paciente") => {
    return (
      <div className="flex flex-col lg:flex-row lg:space-x-6 w-full">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              setSelectedDate(date)
              // When a date is selected, we don't need to do anything else here
              // as the UI will re-render with the filtered sessions for the selected date
            }
          }}
          className="rounded-md border"
          style={{ backgroundColor: "#142B2A", borderRadius: "8px", padding: "10px" }}
          locale={es}
        />

        <div className="w-full mt-4 lg:mt-0 space-y-2 max-h-[500px] overflow-y-auto">
          <h4 className="font-semibold text-white">
            Sesiones para {format(selectedDate, "dd/MM/yyyy", { locale: es })}
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {getSesionesForDate(selectedDate, filterType).map((sesion) => (
              <Card key={sesion.id} className="p-3" style={{ backgroundColor: "#142B2A" }}>
                <div className="flex items-start justify-between"> {/* items-start for alignment */}
                    <div className="space-y-1 flex-grow"> {/* This div wraps the session details */}
                        <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" style={{ color: "#F1C77A" }} />
                            <span className="text-sm text-white">
                                {format(parseISO(sesion.fechaHoraInicio), "HH:mm")} -{" "}
                                {format(parseISO(sesion.fechaHoraFin), "HH:mm")}
                            </span>
                        </div>
                        {sesion.psicologo && (
                            <div className="flex items-center space-x-2">
                                <Brain className="w-4 h-4 text-teal-400" />
                                <span className="text-sm text-gray-300">
                                    Psicóloga/o {sesion.psicologo.persona.nombre} {sesion.psicologo.persona.apellido}
                                </span>
                            </div>
                        )}
                        {sesion.modalidad && (
                            <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-green-400" />
                                <span className="text-sm text-gray-300">{sesion.modalidad.nombre}</span>
                            </div>
                        )}
                        {sesion.estado && (
                            <div className="flex items-center space-x-2">
                                <Activity className="w-4 h-4 text-orange-400" />
                                <span className="text-sm text-gray-300">{sesion.estado.nombre}</span>
                            </div>
                        )}
                        {sesion.pacientes && sesion.pacientes.length > 0 && (
                            <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-purple-400" />
                                <span className="text-sm text-gray-300">
                                    {sesion.pacientes.map((p) => `${p.persona.nombre} ${p.persona.apellido}`).join(", ")}
                                </span>
                            </div>
                        )}
                    </div>
                    {permisos.includes("Editar Sesión") && (
                        <Button
                            variant="ghost"
                            size="icon" 
                            onClick={() => handleOpenEditDialog(sesion)}
                            disabled={sesion.estado?.nombre === "Finalizada" || sesion.estado?.nombre === "Cancelada"}
                            title={
                                sesion.estado?.nombre === "Finalizada" || sesion.estado?.nombre === "Cancelada"
                                    ? "No se puede editar una sesión finalizada o cancelada"
                                    : "Editar Sesión"
                            }
                            className="text-white hover:text-yellow-400 disabled:text-gray-500 disabled:cursor-not-allowed p-1 flex-shrink-0 ml-2"
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                    )}
                </div>
              </Card>
            ))}
            {getSesionesForDate(selectedDate, filterType).length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No hay sesiones programadas para esta fecha</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#152A2A" }}>
        <div className="text-white text-lg">Cargando...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const nombreCompleto = session.user.persona
    ? `${session.user.persona.nombre} ${session.user.persona.apellido}`
    : session.user.email || "Usuario"

  const puedeRegistrarSesiones = permisos.includes("Registrar Sesión")
  const puedeVerSesiones = permisos.includes("Ver Sesiones")
  const puedeAsignarProfesional = permisos.includes("Asignar Profesional")

  const defaultTabValue = puedeRegistrarSesiones
  ? "registrar"
  : session?.user?.psicologoId
  ? "psicologo"
  : session?.user?.pacienteId
  ? "paciente"
  : undefined;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#152A2A" }}>
      {/* Navigation Bar */}
      <nav className="w-full p-4" style={{ backgroundColor: "#1D3434" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10">
              <MemopsyLogo />
            </div>
            <h1 className="text-xl font-bold" style={{ color: "#F1C77A" }}>
              MemoPsy
            </h1>
          </div>
          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg hover:bg-opacity-80 transition-colors"
            style={{ backgroundColor: "#152A2A" }}
          >
            {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div
            className="absolute top-16 right-4 w-64 rounded-lg shadow-lg z-50"
            style={{ backgroundColor: "#1D3434" }}
          >
            <div className="p-4 border-b border-gray-600">
              <p className="text-sm text-gray-300">Conectado como:</p>
              <p className="font-semibold text-white">{session.user.email}</p>
              <p className="text-sm" style={{ color: "#F1C77A" }}>
                {nombreCompleto}
              </p>
            </div>

            <div className="p-2">
              <h3 className="px-2 py-1 text-sm font-semibold text-gray-300 uppercase tracking-wide">
                Módulos Principales
              </h3>
              {modulosPermitidos.length > 0 ? (
                modulosPermitidos.map((modulo) => {
                  const IconComponent = modulo.icon
                  return (
                    <button
                      key={modulo.id}
                      onClick={() => navigateToModule(modulo.ruta)}
                      className="w-full flex items-center px-2 py-2 text-left text-white hover:bg-opacity-80 rounded-lg transition-colors"
                      style={{ backgroundColor: "transparent" }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.backgroundColor = "#152A2A")}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.backgroundColor = "transparent")}
                    >
                      <IconComponent className="w-5 h-5 mr-3" />
                      <div>
                        <div className="font-medium">{modulo.nombre}</div>
                      </div>
                    </button>
                  )
                })
              ) : (
                <p className="px-2 py-2 text-sm text-gray-400">No tienes permisos para otros módulos.</p>
              )}
            </div>

            <div className="p-2 border-t border-gray-600">
              <button
                onClick={() => router.push("/welcome")}
                className="w-full flex items-center px-2 py-2 text-left text-white hover:bg-opacity-80 rounded-lg transition-colors"
                style={{ backgroundColor: "transparent" }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.backgroundColor = "#152A2A")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.backgroundColor = "transparent")}
              >
                <HomeIcon className="w-5 h-5 mr-3" />
                Home
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3" style={{ color: "#F1C77A" }}>
            Gestión de Sesiones
          </h1>
          <p className="text-xl text-gray-300">Administra las sesiones de terapia del sistema.</p>
        </div>

        {puedeVerSesiones ? (
          <Tabs
            defaultValue={defaultTabValue}
            className="w-full"
            onValueChange={(value) => {
              // When changing tabs, we keep the same selected date
              // This ensures consistency across different views
            }}
          >
            <TabsList className="grid w-full grid-cols-3" style={{ backgroundColor: "#1D3434" }}>
              {puedeRegistrarSesiones && (
                <TabsTrigger
                  value="registrar"
                  className="text-white data-[state=active]:bg-[#152A2A] data-[state=active]:text-[#F1C77A]"
                >
                  Registrar Sesiones
                </TabsTrigger>
              )}
              {session?.user?.psicologoId && (
              <TabsTrigger
                value="psicologo"
                className="text-white data-[state=active]:bg-[#152A2A] data-[state=active]:text-[#F1C77A]"
              >
                Mis Sesiones (Psicólogo)
              </TabsTrigger>
              )}
              {session?.user?.pacienteId && (
              <TabsTrigger
                value="paciente"
                className="text-white data-[state=active]:bg-[#152A2A] data-[state=active]:text-[#F1C77A]"
              >
                Mis Sesiones (Paciente)
              </TabsTrigger>
              )}
            </TabsList>

            {puedeRegistrarSesiones && (
              <TabsContent value="registrar" className="space-y-4">
                <Card style={{ backgroundColor: "#1D3434" }}>
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Plus className="w-5 h-5" style={{ color: "#F1C77A" }} />
                      <span>Calendario de Registro de Sesiones</span>
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Selecciona una fecha para programar una nueva sesión
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-start space-x-6">
                      <div className="flex-1">{renderCalendarWithSessions("all")}</div>
                      <div className="flex-shrink-0">
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="w-full" style={{ backgroundColor: "#F1C77A", color: "#1D3434" }}>
                              <Plus className="w-4 h-4 mr-2" />
                              Nueva Sesión
                            </Button>
                          </DialogTrigger>
                          <DialogContent
                            className="sm:max-w-[500px]"
                            style={{ backgroundColor: "#1D3434", border: "1px solid #F1C77A" }}
                          >
                            <DialogHeader>
                              <DialogTitle className="text-white">Registrar Nueva Sesión</DialogTitle>
                              <DialogDescription className="text-gray-300">
                                Complete los datos para programar una nueva sesión.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="fechaInicio" className="text-white">
                                    Fecha Inicio
                                  </Label>
                                  <Input
                                    id="fechaInicio"
                                    type="date"
                                    value={formData.fechaInicio}
                                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                                    className={cn(
                                      "bg-[#152A2A] text-white border-gray-600",
                                      formErrors.fechaInicio && "border-red-500",
                                    )}
                                  />
                                  {formErrors.fechaInicio && (
                                    <p className="text-xs text-red-500">{formErrors.fechaInicio}</p>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="horaInicio" className="text-white">
                                    Hora Inicio
                                  </Label>
                                  <Input
                                    id="horaInicio"
                                    type="time"
                                    value={formData.horaInicio}
                                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                                    className={cn(
                                      "bg-[#152A2A] text-white border-gray-600",
                                      formErrors.horaInicio && "border-red-500",
                                    )}
                                  />
                                  {formErrors.horaInicio && (
                                    <p className="text-xs text-red-500">{formErrors.horaInicio}</p>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="fechaFin" className="text-white">
                                    Fecha Fin
                                  </Label>
                                  <Input
                                    id="fechaFin"
                                    type="date"
                                    value={formData.fechaFin}
                                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                                    className={cn(
                                      "bg-[#152A2A] text-white border-gray-600",
                                      formErrors.fechaFin && "border-red-500",
                                    )}
                                  />
                                  {formErrors.fechaFin && <p className="text-xs text-red-500">{formErrors.fechaFin}</p>}
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="horaFin" className="text-white">
                                    Hora Fin
                                  </Label>
                                  <Input
                                    id="horaFin"
                                    type="time"
                                    value={formData.horaFin}
                                    onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                                    className={cn(
                                      "bg-[#152A2A] text-white border-gray-600",
                                      formErrors.horaFin && "border-red-500",
                                    )}
                                  />
                                  {formErrors.horaFin && <p className="text-xs text-red-500">{formErrors.horaFin}</p>}
                                </div>
                              </div>

                              {/* Psicólogo con búsqueda */}
                              <div className="space-y-2">
                                <Label htmlFor="psicologo_search_create_input" className="text-white">
                                  Psicólogo
                                </Label>
                                <div id="create-psicologo-popover-wrapper" className="relative">
                                  <Input
                                    id="psicologo_search_create_input" 
                                    type="text"
                                    placeholder="Buscar psicólogo..."
                                    value={psicologoSearch}
                                    onChange={(e) => setPsicologoSearch(e.target.value)}
                                    onFocus={() => setIsPsicologoPopoverOpen(true)}
                                    className={cn(
                                      "bg-[#152A2A] text-white border-gray-600",
                                      formErrors.psicologoId && "border-red-500",
                                    )}
                                  />
                                  {isPsicologoPopoverOpen && (
                                    <div className="absolute z-50 w-full mt-1 bg-[#1D3434] border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                                      {psicologoSearchResults.length > 0 ? (
                                        psicologoSearchResults.map((psicologo) => (
                                          <div
                                            key={psicologo.id}
                                            className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-[#152A2A] text-white border-b border-gray-700 last:border-b-0"
                                            onClick={() => handleSelectPsicologo(psicologo)}
                                          >
                                            <Check
                                              className={cn(
                                                "h-4 w-4",
                                                formData.psicologoId === psicologo.id ? "opacity-100" : "opacity-0",
                                              )}
                                            />
                                            <span>{psicologo.persona.nombreCompleto}</span>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="px-3 py-6 text-center text-sm text-gray-400">
                                          {psicologoSearch.length > 1
                                            ? "No se encontraron psicólogos"
                                            : "Escribe para buscar psicólogos"}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {formErrors.psicologoId && (
                                  <p className="text-xs text-red-500">{formErrors.psicologoId}</p>
                                )}
                              </div>

                              {/* Modalidad */}
                              <div className="space-y-2">
                                <Label htmlFor="modalidad" className="text-white">
                                  Modalidad
                                </Label>
                                <Select
                                  value={formData.modalidadId}
                                  onValueChange={(value) => setFormData({ ...formData, modalidadId: value })}
                                >
                                  <SelectTrigger
                                    className={cn(
                                      "bg-[#152A2A] text-white border-gray-600",
                                      formErrors.modalidadId && "border-red-500",
                                    )}
                                  >
                                    <SelectValue placeholder="Seleccionar modalidad" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#1D3434] text-white border-gray-600">
                                    {modalidades.map((modalidad) => (
                                      <SelectItem key={modalidad.id} value={modalidad.id} className="text-white">
                                        {modalidad.nombre}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {formErrors.modalidadId && (
                                  <p className="text-xs text-red-500">{formErrors.modalidadId}</p>
                                )}
                              </div>

                              {/* Estado */}
                              <div className="space-y-2">
                                <Label htmlFor="estado" className="text-white">
                                  Estado
                                </Label>
                                <Select
                                  value={formData.estadoId}
                                  onValueChange={(value) => setFormData({ ...formData, estadoId: value })}
                                >
                                  <SelectTrigger
                                    className={cn(
                                      "bg-[#152A2A] text-white border-gray-600",
                                      formErrors.estadoId && "border-red-500",
                                    )}
                                  >
                                    <SelectValue placeholder="Seleccionar estado" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#1D3434] text-white border-gray-600">
                                    {estados.map((estado) => (
                                      <SelectItem key={estado.id} value={estado.id} className="text-white">
                                        {estado.nombre}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {formErrors.estadoId && <p className="text-xs text-red-500">{formErrors.estadoId}</p>}
                              </div>

                              {/* Pacientes con búsqueda y selección múltiple */}
                              <div className="space-y-2">
                                <Label htmlFor="paciente_search_create_input" className="text-white">
                                  Pacientes
                                </Label>
                                <div
                                  className={cn(
                                    "min-h-10 p-2 rounded-md border bg-[#152A2A] text-white w-full",
                                    formErrors.pacientesIds && "border-red-500",
                                    !formErrors.pacientesIds && "border-gray-600",
                                  )}
                                >
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {selectedPacientes.map((paciente) => (
                                      <Badge
                                        key={paciente.id}
                                        className="bg-[#F1C77A] text-[#1D3434] hover:bg-[#e0b66e]"
                                      >
                                        {paciente.persona.nombreCompleto}
                                        <button
                                          type="button"
                                          className="ml-1 rounded-full outline-none"
                                          onClick={() => handleRemovePaciente(paciente.id)}
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </Badge>
                                    ))}
                                  </div>
                                  <div id="create-paciente-popover-wrapper" className="relative"> 
                                    <Input
                                      id="paciente_search_create_input"
                                      type="text"
                                      placeholder="Buscar pacientes..."
                                      value={pacienteSearch}
                                      onChange={(e) => setPacienteSearch(e.target.value)}
                                      onFocus={() => setIsPacientePopoverOpen(true)}
                                      className="bg-transparent border-0 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none p-0 w-full"
                                    />
                                    {isPacientePopoverOpen && (
                                      <div className="absolute z-50 w-full mt-1 bg-[#1D3434] border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                                        {pacienteSearchResults.length > 0 ? (
                                          pacienteSearchResults.map((paciente) => (
                                            <div
                                              key={paciente.id}
                                              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-[#152A2A] text-white border-b border-gray-700 last:border-b-0"
                                              onClick={() => handleSelectPaciente(paciente)}
                                            >
                                              <Check
                                                className={cn(
                                                  "h-4 w-4",
                                                  selectedPacientes.some((p) => p.id === paciente.id)
                                                    ? "opacity-100"
                                                    : "opacity-0",
                                                )}
                                              />
                                              <span>{paciente.persona.nombreCompleto}</span>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="px-3 py-6 text-center text-sm text-gray-400">
                                            {pacienteSearch.length > 1
                                              ? "No se encontraron pacientes"
                                              : "Escribe para buscar pacientes"}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {formErrors.pacientesIds && (
                                  <p className="text-xs text-red-500">{formErrors.pacientesIds}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsCreateDialogOpen(false)}
                                className="border-gray-600 text-gray-300"
                                disabled={isSubmitting}
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={handleCreateSesion}
                                style={{ backgroundColor: "#F1C77A", color: "#1D3434" }}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? "Creando..." : "Crear Sesión"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {session?.user?.psicologoId && (
            <TabsContent value="psicologo" className="space-y-4">
              <Card style={{ backgroundColor: "#1D3434" }}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Brain className="w-5 h-5" style={{ color: "#F1C77A" }} />
                    <span>Mis Sesiones como Psicólogo</span>
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Sesiones donde figuras como psicólogo asignado
                  </CardDescription>
                </CardHeader>
                <CardContent>{renderCalendarWithSessions("psicologo")}</CardContent>
              </Card>
            </TabsContent>
            )}
            {session?.user?.pacienteId && (
            <TabsContent value="paciente" className="space-y-4">
              <Card style={{ backgroundColor: "#1D3434" }}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <User className="w-5 h-5" style={{ color: "#F1C77A" }} />
                    <span>Mis Sesiones como Paciente</span>
                  </CardTitle>
                  <CardDescription className="text-gray-300">Sesiones donde figuras como paciente</CardDescription>
                </CardHeader>
                <CardContent>{renderCalendarWithSessions("paciente")}</CardContent>
              </Card>
            </TabsContent>
            )}
          </Tabs>
        ) : (
          <div className="text-center mt-12">
            <div className="p-8 rounded-2xl max-w-md mx-auto" style={{ backgroundColor: "#1D3434" }}>
              <CalendarIcon className="w-16 h-16 mx-auto mb-6" style={{ color: "#F1C77A" }} />
              <h3 className="text-2xl font-semibold text-white mb-4">Sin Acceso a Sesiones</h3>
              <p className="text-gray-300">
                No tienes los permisos necesarios para ver las sesiones. Si crees que esto es un error, por favor
                contacta al administrador del sistema.
              </p>
            </div>
          </div>
        )}
      </main>

    {/* Edit Sesion Dialog */}
    <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) { 
            setEditPsicologoSearch("");
            setEditPacienteSearch("");
            setEditPsicologoSearchResults([]);
            setEditPacienteSearchResults([]);
            const originalPacientes = editingSesion?.pacientes?.map(p => ({
                id: p.id,
                persona: {
                    nombre: p.persona.nombre,
                    apellido: p.persona.apellido,
                    nombreCompleto: `${p.persona.nombre} ${p.persona.apellido}`
                }
            })) || [];
            setEditSelectedPacientes(originalPacientes);
            if (editingSesion) {
                 setEditFormData({
                    id: editingSesion.id,
                    fechaInicio: format(parseISO(editingSesion.fechaHoraInicio), "yyyy-MM-dd"),
                    horaInicio: format(parseISO(editingSesion.fechaHoraInicio), "HH:mm"),
                    fechaFin: format(parseISO(editingSesion.fechaHoraFin), "yyyy-MM-dd"),
                    horaFin: format(parseISO(editingSesion.fechaHoraFin), "HH:mm"),
                    psicologoId: editingSesion.psicologo?.id || "",
                    modalidadId: editingSesion.modalidad?.id || "",
                    estadoId: editingSesion.estado?.id || "",
                    pacientesIds: originalPacientes.map(p => p.id),
                });
            }
            setEditFormErrors({});
        }
        setIsEditDialogOpen(isOpen);
    }}>
        <DialogContent className="sm:max-w-[500px]" style={{ backgroundColor: "#1D3434", border: "1px solid #F1C77A" }}>
            <DialogHeader>
                <DialogTitle className="text-white">Editar Sesión</DialogTitle>
                <DialogDescription className="text-gray-300">
                    Modifique los datos de la sesión.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[65vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {/* Fecha Inicio y Hora Inicio */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit_fechaInicio" className="text-white">Fecha Inicio</Label>
                        <Input id="edit_fechaInicio" type="date" value={editFormData.fechaInicio} onChange={(e) => setEditFormData({ ...editFormData, fechaInicio: e.target.value })} className={cn("bg-[#152A2A] text-white border-gray-600 w-full", editFormErrors.fechaInicio && "border-red-500")} />
                        {editFormErrors.fechaInicio && <p className="text-xs text-red-500">{editFormErrors.fechaInicio}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_horaInicio" className="text-white">Hora Inicio</Label>
                        <Input id="edit_horaInicio" type="time" value={editFormData.horaInicio} onChange={(e) => setEditFormData({ ...editFormData, horaInicio: e.target.value })} className={cn("bg-[#152A2A] text-white border-gray-600 w-full", editFormErrors.horaInicio && "border-red-500")} />
                        {editFormErrors.horaInicio && <p className="text-xs text-red-500">{editFormErrors.horaInicio}</p>}
                    </div>
                </div>
                {/* Fecha Fin y Hora Fin */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit_fechaFin" className="text-white">Fecha Fin</Label>
                        <Input id="edit_fechaFin" type="date" value={editFormData.fechaFin} onChange={(e) => setEditFormData({ ...editFormData, fechaFin: e.target.value })} className={cn("bg-[#152A2A] text-white border-gray-600 w-full", editFormErrors.fechaFin && "border-red-500")} />
                        {editFormErrors.fechaFin && <p className="text-xs text-red-500">{editFormErrors.fechaFin}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_horaFin" className="text-white">Hora Fin</Label>
                        <Input id="edit_horaFin" type="time" value={editFormData.horaFin} onChange={(e) => setEditFormData({ ...editFormData, horaFin: e.target.value })} className={cn("bg-[#152A2A] text-white border-gray-600 w-full", editFormErrors.horaFin && "border-red-500")} />
                        {editFormErrors.horaFin && <p className="text-xs text-red-500">{editFormErrors.horaFin}</p>}
                    </div>
                </div>

                {/* Psicólogo con búsqueda (Edit) */}
                <div className="space-y-2">
                    <Label htmlFor="edit_psicologo_search_input" className="text-white">Psicólogo</Label>
                    <div id="edit-psicologo-popover-wrapper" className="relative">
                        <Input
                            id="edit_psicologo_search_input"
                            type="text" placeholder="Buscar psicólogo..."
                            value={editPsicologoSearch}
                            onChange={(e) => setEditPsicologoSearch(e.target.value)}
                            onFocus={() => setIsEditPsicologoPopoverOpen(true)}
                            className={cn("bg-[#152A2A] text-white border-gray-600 w-full", editFormErrors.psicologoId && "border-red-500")}
                        />
                        {isEditPsicologoPopoverOpen && editPsicologoSearch.trim().length > 1 && (
                            <div className="absolute z-[60] w-full mt-1 bg-[#1D3434] border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                                {editPsicologoSearchResults.length > 0 ? (
                                    editPsicologoSearchResults.map((psicologo) => (
                                        <div key={psicologo.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-[#152A2A] text-white border-b border-gray-700 last:border-b-0" onClick={() => handleSelectEditPsicologo(psicologo)}>
                                            <Check className={cn("h-4 w-4", editFormData.psicologoId === psicologo.id ? "opacity-100" : "opacity-0")} />
                                            <span>{psicologo.persona.nombreCompleto}</span>
                                        </div>
                                    ))
                                ) : ( <div className="px-3 py-6 text-center text-sm text-gray-400">No se encontraron psicólogos.</div> )}
                            </div>
                        )}
                         {isEditPsicologoPopoverOpen && editPsicologoSearch.trim().length <= 1 && (
                            <div className="absolute z-[60] w-full mt-1 bg-[#1D3434] border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                                <div className="px-3 py-6 text-center text-sm text-gray-400">Escribe al menos 2 caracteres para buscar.</div>
                            </div>
                        )}
                    </div>
                    {editFormErrors.psicologoId && <p className="text-xs text-red-500">{editFormErrors.psicologoId}</p>}
                </div>

                {/* Modalidad (Edit) */}
                <div className="space-y-2">
                    <Label htmlFor="edit_modalidad_trigger" className="text-white">Modalidad</Label>
                    <Select value={editFormData.modalidadId} onValueChange={(value) => setEditFormData({ ...editFormData, modalidadId: value })}>
                        <SelectTrigger id="edit_modalidad_trigger" className={cn("bg-[#152A2A] text-white border-gray-600 w-full", editFormErrors.modalidadId && "border-red-500")}>
                            <SelectValue placeholder="Seleccionar modalidad" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1D3434] text-white border-gray-600 z-[60]">
                            {modalidades.map((modalidad) => (
                                <SelectItem key={modalidad.id} value={modalidad.id} className="text-white hover:bg-[#152A2A]">{modalidad.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {editFormErrors.modalidadId && <p className="text-xs text-red-500">{editFormErrors.modalidadId}</p>}
                </div>

                {/* Estado (Edit) */}
                <div className="space-y-2">
                    <Label htmlFor="edit_estado_trigger" className="text-white">Estado</Label>
                    <Select value={editFormData.estadoId} onValueChange={(value) => setEditFormData({ ...editFormData, estadoId: value })}>
                        <SelectTrigger id="edit_estado_trigger" className={cn("bg-[#152A2A] text-white border-gray-600 w-full", editFormErrors.estadoId && "border-red-500")}>
                            <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1D3434] text-white border-gray-600 z-[60]">
                            {estados.map((estado) => (
                                <SelectItem key={estado.id} value={estado.id} className="text-white hover:bg-[#152A2A]">{estado.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {editFormErrors.estadoId && <p className="text-xs text-red-500">{editFormErrors.estadoId}</p>}
                </div>

                {/* Pacientes con búsqueda y selección múltiple (Edit) */}
                <div className="space-y-2">
                    <Label htmlFor="edit_pacientes_search_input" className="text-white">Pacientes</Label>
                    <div id="edit-paciente-popover-wrapper" className="relative">
                        <div className={cn("min-h-10 p-2 rounded-md border bg-[#152A2A] text-white w-full", editFormErrors.pacientesIds && "border-red-500", !editFormErrors.pacientesIds && "border-gray-600")}>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {editSelectedPacientes.map((paciente) => (
                                    <Badge key={paciente.id} className="bg-[#F1C77A] text-[#1D3434] hover:bg-[#e0b66e]">
                                        {paciente.persona.nombreCompleto}
                                        <button type="button" className="ml-1 rounded-full outline-none focus:outline-none" onClick={() => handleRemoveEditPaciente(paciente.id)}><X className="h-3 w-3" /></button>
                                    </Badge>
                                ))}
                            </div>
                            <Input
                                id="edit_pacientes_search_input"
                                type="text" placeholder="Buscar pacientes..."
                                value={editPacienteSearch}
                                onChange={(e) => setEditPacienteSearch(e.target.value)}
                                onFocus={() => setIsEditPacientePopoverOpen(true)}
                                className="bg-transparent border-0 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none p-0 w-full"
                            />
                            {isEditPacientePopoverOpen && editPacienteSearch.trim().length > 1 && (
                                <div className="absolute z-[60] w-full mt-1 bg-[#1D3434] border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {editPacienteSearchResults.length > 0 ? (
                                        editPacienteSearchResults.map((paciente) => (
                                            <div key={paciente.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-[#152A2A] text-white border-b border-gray-700 last:border-b-0" onClick={() => handleSelectEditPaciente(paciente)}>
                                                <Check className={cn("h-4 w-4", editSelectedPacientes.some(p => p.id === paciente.id) ? "opacity-100" : "opacity-0")} />
                                                <span>{paciente.persona.nombreCompleto}</span>
                                            </div>
                                        ))
                                    ) : ( <div className="px-3 py-6 text-center text-sm text-gray-400">No se encontraron pacientes.</div> )}
                                </div>
                            )}
                            {isEditPacientePopoverOpen && editPacienteSearch.trim().length <= 1 && (
                                <div className="absolute z-[60] w-full mt-1 bg-[#1D3434] border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                                    <div className="px-3 py-6 text-center text-sm text-gray-400">Escribe al menos 2 caracteres para buscar.</div>
                                </div>
                            )}
                        </div>
                    </div>
                    {editFormErrors.pacientesIds && <p className="text-xs text-red-500">{editFormErrors.pacientesIds}</p>}
                </div>
                {editFormErrors.general && <p className="text-sm text-red-500 py-2 text-center">{editFormErrors.general}</p>}
            </div>
            <div className="flex justify-end space-x-2 pt-4 mt-auto border-t border-gray-700"> 
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-gray-600 text-gray-300 hover:bg-gray-700" disabled={isEditSubmitting}>Cancelar</Button>
                <Button 
                    onClick={handleUpdateSesion} 
                    style={{ backgroundColor: "#F1C77A", color: "#1D3434" }} 
                    disabled={isEditSubmitting || editingSesion?.estado?.nombre === "Finalizada" || editingSesion?.estado?.nombre === "Cancelada"}
                    title={editingSesion?.estado?.nombre === "Finalizada" || editingSesion?.estado?.nombre === "Cancelada" ? "No se puede guardar una sesión finalizada o cancelada" : ""}
                >
                    {isEditSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
            </div>
        </DialogContent>
    </Dialog>

    </div>
  )
}