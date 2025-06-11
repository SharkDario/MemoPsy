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
  FileText,
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

  // Refs para debounce
  const psicologoSearchTimeout = useRef<NodeJS.Timeout | null>(null)
  const pacienteSearchTimeout = useRef<NodeJS.Timeout | null>(null)

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
        searchPsicologos(psicologoSearch)
      }, 300)
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
        searchPacientes(pacienteSearch)
      }, 300)
    }

    return () => {
      if (pacienteSearchTimeout.current) {
        clearTimeout(pacienteSearchTimeout.current)
      }
    }
  }, [pacienteSearch])

  // Agregar este useEffect después de los otros useEffect existentes
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest(".relative")) {
        setIsPsicologoPopoverOpen(false)
        setIsPacientePopoverOpen(false)
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

  const searchPsicologos = async (query: string) => {
    try {
      if (query.trim().length < 2) {
        setPsicologoSearchResults([])
        return
      }

      const response = await fetch(`/api/psicologos/buscar?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setPsicologoSearchResults(data)
      }
    } catch (error) {
      console.error("Error searching psychologists:", error)
    }
  }

  const searchPacientes = async (query: string) => {
    try {
      if (query.trim().length < 2) {
        setPacienteSearchResults([])
        return
      }

      const response = await fetch(`/api/pacientes/buscar?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setPacienteSearchResults(data)
      }
    } catch (error) {
      console.error("Error searching patients:", error)
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
        return sesion.psicologo?.id === session?.user?.id
      }

      if (filterType === "paciente") {
        // Solo mostrar sesiones donde el usuario es paciente
        return sesion.pacientes?.some((p) => p.id === session?.user?.id)
      }

      return true // 'all' - mostrar todas las sesiones (para administradores)
    })
  }

  const renderCalendarWithSessions = (filterType: "all" | "psicologo" | "paciente") => {
    return (
      <div className="space-y-4">
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
          locale={es}
        />

        <div className="space-y-2">
          <h4 className="font-semibold text-white">
            Sesiones para {format(selectedDate, "dd/MM/yyyy", { locale: es })}
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {getSesionesForDate(selectedDate, filterType).map((sesion) => (
              <Card key={sesion.id} className="p-3" style={{ backgroundColor: "#1D3434" }}>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
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
            defaultValue="registrar"
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
              <TabsTrigger
                value="psicologo"
                className="text-white data-[state=active]:bg-[#152A2A] data-[state=active]:text-[#F1C77A]"
              >
                Mis Sesiones (Psicólogo)
              </TabsTrigger>
              <TabsTrigger
                value="paciente"
                className="text-white data-[state=active]:bg-[#152A2A] data-[state=active]:text-[#F1C77A]"
              >
                Mis Sesiones (Paciente)
              </TabsTrigger>
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
                                <Label htmlFor="psicologo" className="text-white">
                                  Psicólogo
                                </Label>
                                <div className="relative">
                                  <Input
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
                                <Label htmlFor="pacientes" className="text-white">
                                  Pacientes
                                </Label>
                                <div
                                  className={cn(
                                    "min-h-10 p-2 rounded-md border bg-[#152A2A] text-white",
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
                                  <div className="relative">
                                    <Input
                                      type="text"
                                      placeholder="Buscar pacientes..."
                                      value={pacienteSearch}
                                      onChange={(e) => setPacienteSearch(e.target.value)}
                                      onFocus={() => setIsPacientePopoverOpen(true)}
                                      className="bg-transparent border-0 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none p-0"
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
    </div>
  )
}

/*
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
} from "lucide-react"
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
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

  // Refs para debounce
  const psicologoSearchTimeout = useRef<NodeJS.Timeout | null>(null)
  const pacienteSearchTimeout = useRef<NodeJS.Timeout | null>(null)

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
        searchPsicologos(psicologoSearch)
      }, 300)
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
        searchPacientes(pacienteSearch)
      }, 300)
    }

    return () => {
      if (pacienteSearchTimeout.current) {
        clearTimeout(pacienteSearchTimeout.current)
      }
    }
  }, [pacienteSearch])

  // Agregar este useEffect después de los otros useEffect existentes
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest(".relative")) {
        setIsPsicologoPopoverOpen(false)
        setIsPacientePopoverOpen(false)
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

  const searchPsicologos = async (query: string) => {
    try {
      if (query.trim().length < 2) {
        setPsicologoSearchResults([])
        return
      }

      const response = await fetch(`/api/psicologos/buscar?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setPsicologoSearchResults(data)
      }
    } catch (error) {
      console.error("Error searching psychologists:", error)
    }
  }

  const searchPacientes = async (query: string) => {
    try {
      if (query.trim().length < 2) {
        setPacienteSearchResults([])
        return
      }

      const response = await fetch(`/api/pacientes/buscar?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setPacienteSearchResults(data)
      }
    } catch (error) {
      console.error("Error searching patients:", error)
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
        loadInitialData() // Recargar datos
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
        return sesion.psicologo?.id === session?.user?.id
      }

      if (filterType === "paciente") {
        // Solo mostrar sesiones donde el usuario es paciente
        return sesion.pacientes?.some((p) => p.id === session?.user?.id)
      }

      return true // 'all' - mostrar todas las sesiones (para administradores)
    })
  }

  const renderCalendarWithSessions = (filterType: "all" | "psicologo" | "paciente") => {
    const currentMonth = startOfMonth(selectedDate)
    const endMonth = endOfMonth(selectedDate)
    const daysInMonth = eachDayOfInterval({ start: currentMonth, end: endMonth })

    return (
      <div className="space-y-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border"
          locale={es}
        />

        <div className="space-y-2">
          <h4 className="font-semibold text-white">
            Sesiones para {format(selectedDate, "dd/MM/yyyy", { locale: es })}
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {getSesionesForDate(selectedDate, filterType).map((sesion) => (
              <Card key={sesion.id} className="p-3" style={{ backgroundColor: "#1D3434" }}>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" style={{ color: "#F1C77A" }} />
                      <span className="text-sm text-white">
                        {format(parseISO(sesion.fechaHoraInicio), "HH:mm")} -{" "}
                        {format(parseISO(sesion.fechaHoraFin), "HH:mm")}
                      </span>
                    </div>
                    {sesion.psicologo && (
                      <div className="flex items-center space-x-2">
                        <Brain className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-300">
                          Dr. {sesion.psicologo.persona.nombre} {sesion.psicologo.persona.apellido}
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#152A2A" }}>
      {/* Navigation Bar *}
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

        {/* Dropdown Menu *}
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

      {/* Main Content *}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3" style={{ color: "#F1C77A" }}>
            Gestión de Sesiones
          </h1>
          <p className="text-xl text-gray-300">Administra las sesiones de terapia del sistema.</p>
        </div>

        {puedeVerSesiones ? (
          <Tabs defaultValue="registrar" className="w-full">
            <TabsList className="grid w-full grid-cols-3" style={{ backgroundColor: "#1D3434" }}>
              {puedeRegistrarSesiones && (
                <TabsTrigger
                  value="registrar"
                  className="text-white data-[state=active]:bg-[#152A2A] data-[state=active]:text-[#F1C77A]"
                >
                  Registrar Sesiones
                </TabsTrigger>
              )}
              <TabsTrigger
                value="psicologo"
                className="text-white data-[state=active]:bg-[#152A2A] data-[state=active]:text-[#F1C77A]"
              >
                Mis Sesiones (Psicólogo)
              </TabsTrigger>
              <TabsTrigger
                value="paciente"
                className="text-white data-[state=active]:bg-[#152A2A] data-[state=active]:text-[#F1C77A]"
              >
                Mis Sesiones (Paciente)
              </TabsTrigger>
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

                              {/* Psicólogo con búsqueda *}
                              <div className="space-y-2">
                                <Label htmlFor="psicologo" className="text-white">
                                  Psicólogo
                                </Label>
                                <div className="relative">
                                  <Input
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

                              {/* Modalidad *}
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

                              {/* Estado *}
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

                              {/* Pacientes con búsqueda y selección múltiple *}
                              <div className="space-y-2">
                                <Label htmlFor="pacientes" className="text-white">
                                  Pacientes
                                </Label>
                                <div
                                  className={cn(
                                    "min-h-10 p-2 rounded-md border bg-[#152A2A] text-white",
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
                                  <div className="relative">
                                    <Input
                                      type="text"
                                      placeholder="Buscar pacientes..."
                                      value={pacienteSearch}
                                      onChange={(e) => setPacienteSearch(e.target.value)}
                                      onFocus={() => setIsPacientePopoverOpen(true)}
                                      className="bg-transparent border-0 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none p-0"
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
    </div>
  )
}
*/
