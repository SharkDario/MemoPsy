'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface Usuario {
  id: string;
  email: string;
  activo: boolean;
  esAdmin: boolean;
  persona: {
    nombre: string;
    apellido: string;
    dni: string;
  } | null;
  perfil: {
    id: string;
    nombre: string;
  } | null;
}

interface Perfil {
  id: string;
  nombre: string;
  descripcion: string;
}

export default function AsignarPerfiles() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [filtro, setFiltro] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  // Cargar usuarios y perfiles al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usuariosRes, perfilesRes] = await Promise.all([
          fetch('/api/auth/profile/usuarios'),
          fetch('/api/auth/profile/perfiles')
        ]);

        if (!usuariosRes.ok || !perfilesRes.ok) {
          throw new Error('Error al cargar datos');
        }

        const usuariosData = await usuariosRes.json();
        const perfilesData = await perfilesRes.json();

        setUsuarios(usuariosData);
        setPerfiles(perfilesData);
      } catch (error) {
        console.error('Error:', error);
        toast.error('No se pudieron cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const usuariosFiltrados = usuarios.filter(
    (usuario) => {
      const nombreCompleto = `${usuario.persona?.nombre || ''} ${usuario.persona?.apellido || ''}`.toLowerCase();
      const email = usuario.email.toLowerCase();
      const perfil = usuario.perfil?.nombre?.toLowerCase() || '';
      const dni = usuario.persona?.dni?.toLowerCase() || '';
      const busqueda = filtro.toLowerCase();

      return (
        nombreCompleto.includes(busqueda) ||
        email.includes(busqueda) ||
        perfil.includes(busqueda) ||
        dni.includes(busqueda)
      );
    }
  );

  const actualizarPerfil = async (usuarioId: string, perfilId: string | null) => {
    setIsSaving(usuarioId);
    
    try {
      const response = await fetch(`/api/auth/profile/usuarios/${usuarioId}/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ perfilId }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el perfil');
      }

      // Actualizar la lista de usuarios
      setUsuarios(usuarios.map(usuario => {
        if (usuario.id === usuarioId) {
          const perfilActualizado = perfilId 
            ? perfiles.find(p => p.id === perfilId) 
            : null;
          
          return {
            ...usuario,
            perfil: perfilActualizado ? {
              id: perfilActualizado.id,
              nombre: perfilActualizado.nombre
            } : null
          };
        }
        return usuario;
      }));

      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('No se pudo actualizar el perfil');
    } finally {
      setIsSaving(null);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Asignación de Perfiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Buscar por nombre, email, DNI o perfil..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="max-w-md"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Perfil Actual</TableHead>
                    <TableHead>Asignar Perfil</TableHead>
                    <TableHead>Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuariosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No se encontraron usuarios
                      </TableCell>
                    </TableRow>
                  ) : (
                    usuariosFiltrados.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell>
                          {usuario.persona ? `${usuario.persona.nombre} ${usuario.persona.apellido}` : 'Sin datos'}
                        </TableCell>
                        <TableCell>{usuario.email}</TableCell>
                        <TableCell>{usuario.persona?.dni || 'Sin DNI'}</TableCell>
                        <TableCell>
                          <Badge variant={usuario.activo ? "success" : "secondary"}>
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                          {usuario.esAdmin && (
                            <Badge variant="default" className="ml-2">Admin</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {usuario.perfil?.nombre || 'Sin perfil'}
                        </TableCell>
                        <TableCell>
                          <Select
                            defaultValue={usuario.perfil?.id || ''}
                            onValueChange={(value) => {
                              const perfilId = value === '' ? null : value;
                              actualizarPerfil(usuario.id, perfilId);
                            }}
                            disabled={isSaving === usuario.id}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Seleccionar perfil" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Sin perfil</SelectItem>
                              {perfiles.map((perfil) => (
                                <SelectItem key={perfil.id} value={perfil.id}>
                                  {perfil.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {isSaving === usuario.id ? (
                            <Button disabled variant="outline" size="sm">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Guardando
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => actualizarPerfil(
                                usuario.id, 
                                usuario.perfil?.id || null
                              )}
                              disabled={isSaving !== null}
                            >
                              Guardar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}