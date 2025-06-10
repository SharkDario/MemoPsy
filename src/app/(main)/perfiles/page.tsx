// app/(main)/perfiles/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, useMemo } from 'react'; // Added useMemo
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MemopsyLogo from "@/app/components/MemopsyLogo";
import { Button } from "@/components/ui/button";
import { Menu, X, Settings, LogOut, Users, Calendar, FileText, Shield, PlusCircle, Edit, Trash2, AlertCircle, KeyRound, Lock } from 'lucide-react'; // Added Lock

interface Perfil {
  id: string;
  nombre: string;
  descripcion: string;
}

interface Permiso {
  id: string;
  nombre: string; // e.g., "Ver Perfiles", "Registrar Usuario"
  descripcion?: string;
  modulo?: { nombre: string };
  accion?: { nombre: string };
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
  {id: 'usuarios', nombre: 'Usuarios', descripcion: 'Gestión de usuarios', icon: Users, ruta: '/usuarios', permisosRequeridos: ['Ver Usuarios', 'Registrar Usuario', 'Editar Usuario', 'Eliminar Usuario']},
  {id: 'sesiones', nombre: 'Sesiones', descripcion: 'Administración de sesiones', icon: Calendar, ruta: '/sesiones', permisosRequeridos: ['Ver Sesiones', 'Registrar Sesión', 'Editar Sesión', 'Eliminar Sesión', 'Asignar Profesional']},
  {id: 'perfiles', nombre: 'Perfiles', descripcion: 'Administración de perfiles', icon: Shield, ruta: '/perfiles', permisosRequeridos: ['Ver Perfiles', /* 'Registrar Perfil', 'Editar Perfil', 'Eliminar Perfil', 'Asignar Perfil', 'Administrar Permisos Perfil' */]}, // Simplified for module access, specific actions checked below
  {id: 'informes', nombre: 'Informes', descripcion: 'Generación de reportes', icon: FileText, ruta: '/informes', permisosRequeridos: ['Ver Informes', 'Registrar Informe', 'Editar Informe', 'Eliminar Informe']}
];

export default function PerfilesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // --- PERMISSION CHECKS ---
  const userPermissionsSet = useMemo(() => {
    // Assuming session.user.permisos is an array of objects like { id, nombre, ... }
    return new Set(session?.user?.permisos?.map((p: Permiso) => p.nombre) || []);
  }, [session]);

  const canViewPerfilesPage = useMemo(() => userPermissionsSet.has('Ver Perfiles'), [userPermissionsSet]);
  const canCreatePerfil = useMemo(() => userPermissionsSet.has('Registrar Perfil'), [userPermissionsSet]);
  const canEditPerfil = useMemo(() => userPermissionsSet.has('Editar Perfil'), [userPermissionsSet]);
  const canDeletePerfil = useMemo(() => userPermissionsSet.has('Eliminar Perfil'), [userPermissionsSet]);
  // Changed 'Asignar Perfil' to 'Administrar Permisos Perfil' as it's more descriptive for managing checkboxes
  const canManageProfilePermissions = useMemo(() => userPermissionsSet.has('Administrar Permisos Perfil'), [userPermissionsSet]);


  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modulosPermitidos, setModulosPermitidos] = useState<ModuloConfig[]>([]);

  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // For initial page data (profiles)
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newProfileNombre, setNewProfileNombre] = useState<string>('');
  const [newProfileDescripcion, setNewProfileDescripcion] = useState<string>('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState<boolean>(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingProfile, setEditingProfile] = useState<Perfil | null>(null);
  const [editNombre, setEditNombre] = useState<string>('');
  const [editDescripcion, setEditDescripcion] = useState<string>('');
  const [editError, setEditError] = useState<string | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);

  const [availablePermissions, setAvailablePermissions] = useState<Permiso[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState<boolean>(true); // For available permissions list
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState<boolean>(false);
  const [selectedProfileForPermissions, setSelectedProfileForPermissions] = useState<Perfil | null>(null);
  const [profilePermissions, setProfilePermissions] = useState<string[]>([]);
  const [isLoadingProfilePermissions, setIsLoadingProfilePermissions] = useState<boolean>(false);
  const [profilePermissionsError, setProfilePermissionsError] = useState<string | null>(null);
  const [isSavingPermissions, setIsSavingPermissions] = useState<boolean>(false);

  const fetchPerfiles = async () => { setLoading(true); setError(null); try { const r = await fetch('/api/perfiles'); if(r.ok){const d=await r.json(); setPerfiles(d.data||[]);}else{setError('Error al cargar perfiles.')} } catch(e){setError('Error de red.')} finally{setLoading(false)} };
  const fetchAvailablePermissions = async () => { setIsLoadingPermissions(true); setPermissionsError(null); try { await new Promise(r => setTimeout(r,300)); const d:Permiso[]=[ {id:'p1',nombre:'Ver Usuarios'},{id:'p2',nombre:'Crear Usuarios'},{id:'p3',nombre:'Editar Usuarios'},{id:'p4',nombre:'Eliminar Usuarios'},{id:'p5',nombre:'Ver Perfiles'},{id:'p6',nombre:'Registrar Perfil'},{id:'p7',nombre:'Editar Perfil'},{id:'p8',nombre:'Eliminar Perfil'},{id:'p9',nombre:'Administrar Permisos Perfil'},{id:'p10',nombre:'Ver Sesiones'} ]; setAvailablePermissions(d); } catch (e){setPermissionsError('Error cargando permisos.')} finally{setIsLoadingPermissions(false)} };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      // Initial data fetch is now dependent on permission
      if (canViewPerfilesPage) {
        fetchPerfiles();
        if (canManageProfilePermissions) { // Only fetch all permissions if user can manage them
             fetchAvailablePermissions();
        } else {
            setIsLoadingPermissions(false); // No need to load these
        }
      } else {
        setLoading(false); // Not allowed to view, so stop main loading
        setIsLoadingPermissions(false); // and permissions loading
      }
    }
  }, [status, router, canViewPerfilesPage, canManageProfilePermissions]); // Add permission check to dependencies

  useEffect(() => { if (session?.user?.permisos) { const p = session.user.permisos.map((i:any)=>i.nombre); setModulosPermitidos(MODULOS_DISPONIBLES.filter(m=>m.permisosRequeridos.some(r=>p.includes(r)))); } }, [session]);

  const handleLogout = async () => await signOut({ redirect: true, callbackUrl: '/login' });
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const navigateToModule = (ruta: string) => { router.push(ruta); setIsMenuOpen(false); };

  const handleOpenCreateModal = () => { if(canCreatePerfil) {setIsCreateModalOpen(true); setNewProfileNombre(''); setNewProfileDescripcion(''); setCreateError(null);} else {alert("No tiene permiso para crear perfiles.")} };
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);
  const handleCreateProfile = async (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); if(!canCreatePerfil) return; setCreateError(null); if(!newProfileNombre.trim()){setCreateError("Nombre obligatorio.");return;} if(!newProfileDescripcion.trim()){setCreateError("Descripción obligatoria.");return;} setIsSubmittingCreate(true); try{const r=await fetch('/api/perfiles',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nombre:newProfileNombre,descripcion:newProfileDescripcion})}); if(r.ok){await fetchPerfiles();handleCloseCreateModal();alert('Perfil creado!');}else{const d=await r.json();setCreateError(d.message||'Error al crear.');}}catch(er){setCreateError('Error de red.');}finally{setIsSubmittingCreate(false);} };

  const handleOpenEditModal = (p: Perfil) => { if(canEditPerfil) {setEditingProfile(p); setEditNombre(p.nombre); setEditDescripcion(p.descripcion); setEditError(null); setIsEditModalOpen(true);} else {alert("No tiene permiso para editar perfiles.")}};
  const handleCloseEditModal = () => { setIsEditModalOpen(false); setEditingProfile(null); };
  const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); if(!editingProfile || !canEditPerfil)return;setEditError(null); if(!editNombre.trim()){setEditError("Nombre obligatorio.");return;} if(!editDescripcion.trim()){setEditError("Descripción obligatoria.");return;} setIsSubmittingEdit(true); try{const r=await fetch(`/api/perfiles/${editingProfile.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({nombre:editNombre,descripcion:editDescripcion})}); if(r.ok){await fetchPerfiles();handleCloseEditModal();alert('Perfil actualizado!');}else{const d=await r.json();setEditError(d.message||'Error al actualizar.');}}catch(er){setEditError('Error de red.');}finally{setIsSubmittingEdit(false);} };

  const handleDeleteProfile = async (id: string) => { if(!canDeletePerfil){alert("No tiene permiso para eliminar perfiles."); return;} if(!window.confirm('¿Eliminar este perfil?'))return; try{const r=await fetch(`/api/perfiles/${id}`,{method:'DELETE'}); if(r.ok){await fetchPerfiles();alert('Perfil eliminado!');}else{const d=await r.json();alert(`Error: ${d.message||'No se pudo eliminar.'}`);}}catch(e){alert('Error de red.');} };

  const handleOpenPermissionsModal = async (p: Perfil) => { if(!canManageProfilePermissions){alert("No tiene permiso para administrar permisos."); return;} setSelectedProfileForPermissions(p); setIsPermissionsModalOpen(true); setIsLoadingProfilePermissions(true); setProfilePermissionsError(null); setProfilePermissions([]); try { await new Promise(r => setTimeout(r, 300)); let mockP:string[]=[]; if(p.id==='1')mockP=['p1','p5']; if(p.id==='2')mockP=['p1','p2','p3','p4','p5','p6','p7','p8','p9']; setProfilePermissions(mockP); } catch (e){setProfilePermissionsError("Error cargando permisos del perfil.");} finally{setIsLoadingProfilePermissions(false);} };
  const handleClosePermissionsModal = () => { setIsPermissionsModalOpen(false); setSelectedProfileForPermissions(null); setProfilePermissions([]); setProfilePermissionsError(null); setIsSavingPermissions(false); };
  const handleTogglePermission = (id: string) => { setProfilePermissions(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); };
  const handleSavePermissions = async () => { if (!selectedProfileForPermissions || !canManageProfilePermissions) return; setIsSavingPermissions(true); setProfilePermissionsError(null); try { console.log(`Guardando permisos para perfil ${selectedProfileForPermissions.id}:`, profilePermissions); await new Promise(resolve => setTimeout(resolve, 1000)); const mockResponse = { ok: true, status: 200, json: async () => ({ success: true, message: "Permisos actualizados" }) }; if (mockResponse.ok) { alert('Permisos actualizados!'); handleClosePermissionsModal(); } else { alert('Error simulado al guardar.'); } } catch (err) { alert('Error de red al guardar.'); console.error("Error saving permissions:", err); } finally { setIsSavingPermissions(false); } };
  
  const nombreCompleto = session?.user?.persona ? `${session.user.persona.nombre} ${session.user.persona.apellido}` : 'Usuario';

  // Handle page loading and authentication status
  if (status === 'loading' || (status === 'authenticated' && loading && canViewPerfilesPage) ) { // Keep loading if auth loading OR if auth done but page data still loading (and allowed)
    return <div className="flex items-center justify-center min-h-screen bg-[#152A2A]"><div className="text-white text-lg">Cargando...</div></div>;
  }
  if (status === 'unauthenticated') { // Should be handled by useEffect, but as a safeguard
    return <div className="flex items-center justify-center min-h-screen bg-[#152A2A]"><div className="text-white text-lg">Redirigiendo a login...</div></div>;
  }
  if (status === 'authenticated' && !canViewPerfilesPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#152A2A] text-white">
        <Lock size={64} className="mb-4 text-red-500" />
        <h1 className="text-3xl font-bold mb-2">Acceso Denegado</h1>
        <p className="text-xl text-gray-300">No tienes permiso para ver esta página.</p>
        <Button onClick={() => router.push('/welcome')} className="mt-6 bg-[#F1C77A] text-[#152A2A] hover:bg-opacity-90">
          Volver a Inicio
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#152A2A]">
      <nav className="w-full p-4 bg-[#1D3434]"> {/* Navbar... (same as before) */} 
          <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4"><div className="w-10 h-10"><MemopsyLogo /></div><h1 className="text-xl font-bold" style={{ color: '#F1C77A' }}>MemoPsy</h1></div>
          <button onClick={toggleMenu} className="p-2 rounded-lg hover:bg-opacity-80 transition-colors" style={{ backgroundColor: '#152A2A' }}>{isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}</button>
        </div>
        {isMenuOpen && session && (
          <div className="absolute top-16 right-4 w-64 rounded-lg shadow-lg z-50" style={{ backgroundColor: '#1D3434' }}>
            <div className="p-4 border-b border-gray-600"><p className="text-sm text-gray-300">Conectado como:</p><p className="font-semibold text-white">{session.user.email}</p><p className="text-sm" style={{ color: '#F1C77A' }}>{nombreCompleto}</p></div>
            <div className="p-2"><h3 className="px-2 py-1 text-sm font-semibold text-gray-300 uppercase tracking-wide">Módulos</h3>
              {modulosPermitidos.length > 0 ? modulosPermitidos.map(m => <button key={m.id} onClick={() => navigateToModule(m.ruta)} className="w-full flex items-center px-2 py-2 text-left text-white hover:bg-opacity-80 rounded-lg transition-colors" style={{ backgroundColor: 'transparent' }} onMouseEnter={e => (e.target as HTMLElement).style.backgroundColor = '#152A2A'} onMouseLeave={e => (e.target as HTMLElement).style.backgroundColor = 'transparent'}><m.icon className="w-5 h-5 mr-3" /><div><div className="font-medium">{m.nombre}</div><div className="text-xs text-gray-400">{m.descripcion}</div></div></button>) : <p className="px-2 py-2 text-sm text-gray-400">No tienes permisos.</p>}</div>
            <div className="p-2 border-t border-gray-600"><button onClick={() => {setIsMenuOpen(false); router.push('/welcome') /* TODO: Actual settings page*/ }} className="w-full flex items-center px-2 py-2 text-left text-white hover:bg-opacity-80 rounded-lg transition-colors" style={{ backgroundColor: 'transparent' }} onMouseEnter={e => (e.target as HTMLElement).style.backgroundColor = '#152A2A'} onMouseLeave={e => (e.target as HTMLElement).style.backgroundColor = 'transparent'}><Settings className="w-5 h-5 mr-3" />Configuración</button><button onClick={handleLogout} className="w-full flex items-center px-2 py-2 text-left text-red-400 hover:bg-red-900 hover:bg-opacity-20 rounded-lg transition-colors"><LogOut className="w-5 h-5 mr-3" />Cerrar Sesión</button></div>
          </div>
        )}
      </nav>
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#F1C77A]">Gestión de Perfiles</h1>
          {canCreatePerfil && (
            <Button onClick={handleOpenCreateModal} style={{ backgroundColor: '#F1C77A', color: '#152A2A' }} className="flex items-center"><PlusCircle className="w-5 h-5 mr-2" />Crear Perfil</Button>
          )}
        </div>

        {isCreateModalOpen && canCreatePerfil && (  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"><div className="p-6 rounded-lg shadow-xl w-full max-w-md" style={{ backgroundColor: '#1D3434' }}><h2 className="text-2xl font-semibold mb-6" style={{ color: '#F1C77A' }}>Crear Perfil</h2><form onSubmit={handleCreateProfile}>{createError && <div className="mb-4 p-3 rounded-md bg-red-900 bg-opacity-50 text-red-300 flex items-center"><AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" /><span>{createError}</span></div>}<div className="mb-4"><label htmlFor="newProfileNombre" className="block text-sm font-medium text-gray-300 mb-1">Nombre</label><input type="text" id="newProfileNombre" value={newProfileNombre} onChange={e => setNewProfileNombre(e.target.value)} className="w-full p-2.5 rounded-md border border-gray-600 focus:ring-2 focus:ring-yellow-500 outline-none text-white" style={{ backgroundColor: '#152A2A' }} disabled={isSubmittingCreate} /></div><div className="mb-6"><label htmlFor="newProfileDescripcion" className="block text-sm font-medium text-gray-300 mb-1">Descripción</label><textarea id="newProfileDescripcion" value={newProfileDescripcion} onChange={e => setNewProfileDescripcion(e.target.value)} rows={3} className="w-full p-2.5 rounded-md border border-gray-600 focus:ring-2 focus:ring-yellow-500 outline-none text-white" style={{ backgroundColor: '#152A2A' }} disabled={isSubmittingCreate} /></div><div className="flex justify-end space-x-3"><Button type="button" onClick={handleCloseCreateModal} variant="outline" disabled={isSubmittingCreate} style={{ borderColor: '#F1C77A', color: '#F1C77A' }} className="hover:bg-yellow-600 hover:bg-opacity-20">Cancelar</Button><Button type="submit" style={{ backgroundColor: '#F1C77A', color: '#152A2A' }} className="hover:bg-opacity-90" disabled={isSubmittingCreate}>{isSubmittingCreate ? 'Guardando...' : 'Guardar'}</Button></div></form></div></div> )}
        {isEditModalOpen && editingProfile && canEditPerfil && ( <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"><div className="p-6 rounded-lg shadow-xl w-full max-w-md" style={{ backgroundColor: '#1D3434' }}><h2 className="text-2xl font-semibold mb-6" style={{ color: '#F1C77A' }}>Editar: {editingProfile.nombre}</h2><form onSubmit={handleUpdateProfile}>{editError && <div className="mb-4 p-3 rounded-md bg-red-900 bg-opacity-50 text-red-300 flex items-center"><AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" /><span>{editError}</span></div>}<div className="mb-4"><label htmlFor="editNombre" className="block text-sm font-medium text-gray-300 mb-1">Nombre</label><input type="text" id="editNombre" value={editNombre} onChange={e => setEditNombre(e.target.value)} className="w-full p-2.5 rounded-md border border-gray-600 focus:ring-2 focus:ring-yellow-500 outline-none text-white" style={{ backgroundColor: '#152A2A' }} disabled={isSubmittingEdit} /></div><div className="mb-6"><label htmlFor="editDescripcion" className="block text-sm font-medium text-gray-300 mb-1">Descripción</label><textarea id="editDescripcion" value={editDescripcion} onChange={e => setEditDescripcion(e.target.value)} rows={3} className="w-full p-2.5 rounded-md border border-gray-600 focus:ring-2 focus:ring-yellow-500 outline-none text-white" style={{ backgroundColor: '#152A2A' }} disabled={isSubmittingEdit} /></div><div className="flex justify-end space-x-3"><Button type="button" onClick={handleCloseEditModal} variant="outline" disabled={isSubmittingEdit} style={{ borderColor: '#F1C77A', color: '#F1C77A' }} className="hover:bg-yellow-600 hover:bg-opacity-20">Cancelar</Button><Button type="submit" style={{ backgroundColor: '#F1C77A', color: '#152A2A' }} className="hover:bg-opacity-90" disabled={isSubmittingEdit}>{isSubmittingEdit ? 'Guardando...' : 'Guardar Cambios'}</Button></div></form></div></div> )}
        
        {isPermissionsModalOpen && selectedProfileForPermissions && canManageProfilePermissions && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
            <div className="p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col bg-[#1D3434]">
              <h2 className="text-2xl font-semibold mb-1 text-[#F1C77A]">Administrar Permisos</h2>
              <p className="text-gray-300 mb-4">Perfil: <span className="font-semibold">{selectedProfileForPermissions.nombre}</span></p>
              {isLoadingPermissions && <p className="text-white text-center py-4">Cargando permisos disponibles...</p>}
              {permissionsError && <div className="my-3 p-3 rounded-md bg-red-900 bg-opacity-50 text-red-300 flex items-center"><AlertCircle className="w-5 h-5 mr-2"/>{permissionsError}</div>}
              {isLoadingProfilePermissions && <p className="text-white text-center py-4">Cargando permisos del perfil...</p>}
              {profilePermissionsError && <div className="my-3 p-3 rounded-md bg-red-900 bg-opacity-50 text-red-300 flex items-center"><AlertCircle className="w-5 h-5 mr-2"/>{profilePermissionsError}</div>}
              {!isLoadingPermissions && !permissionsError && !isLoadingProfilePermissions && !profilePermissionsError && (
                <div className="overflow-y-auto flex-grow pr-2 space-y-3 mb-4">
                  {availablePermissions.map(perm => (
                    <label key={perm.id} htmlFor={`perm-${perm.id}`} className="flex items-center p-3 rounded-md hover:bg-gray-700 cursor-pointer bg-[#152A2A]">
                      <input type="checkbox" id={`perm-${perm.id}`} checked={profilePermissions.includes(perm.id)} onChange={() => handleTogglePermission(perm.id)} className="w-5 h-5 rounded text-yellow-500 focus:ring-yellow-400 bg-gray-600 border-gray-500" disabled={isSavingPermissions}/>
                      <span className="ml-3 text-sm font-medium text-gray-200">{perm.nombre}</span>
                      {perm.modulo && <span className="ml-auto text-xs text-gray-400 bg-gray-600 px-2 py-0.5 rounded-full">{perm.modulo.nombre}</span>}
                    </label>
                  ))}
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600">
                <Button type="button" onClick={handleClosePermissionsModal} variant="outline" style={{ borderColor: '#F1C77A', color: '#F1C77A' }} className="hover:bg-yellow-600 hover:bg-opacity-20" disabled={isSavingPermissions}>Cancelar</Button>
                <Button type="button" onClick={handleSavePermissions} style={{ backgroundColor: '#F1C77A', color: '#152A2A' }} className="hover:bg-opacity-90" disabled={isSavingPermissions || isLoadingPermissions || isLoadingProfilePermissions || !canManageProfilePermissions}>
                  {isSavingPermissions ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Table - Render only if allowed and not loading/error */}
        {!loading && !error && !permissionsError && canViewPerfilesPage && (
          <div className="shadow-lg rounded-2xl bg-[#1D3434]">
            {perfiles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-white">
                  <thead className="bg-[#152A2A]"><tr className="border-b border-gray-700">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#F1C77A]">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#F1C77A]">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#F1C77A]">Desc.</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#F1C77A]">Acciones</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-700">
                    {perfiles.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-800/40">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{p.id}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100">{p.nombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-300 max-w-xs break-words">{p.descripcion}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm space-x-1">
                          {canEditPerfil && <Button variant="outline" size="sm" onClick={()=>handleOpenEditModal(p)} style={{borderColor:'#F1C77A',color:'#F1C77A',padding:'0.25rem 0.5rem'}} className="hover:bg-yellow-600/20"><Edit className="w-3.5 h-3.5 mr-1"/>Editar</Button>}
                          {canDeletePerfil && <Button variant="destructive" size="sm" onClick={()=>handleDeleteProfile(p.id)} style={{padding:'0.25rem 0.5rem'}} className="bg-red-700 hover:bg-red-800"><Trash2 className="w-3.5 h-3.5 mr-1"/>Eliminar</Button>}
                          {canManageProfilePermissions && <Button variant="outline" size="sm" onClick={()=>handleOpenPermissionsModal(p)} style={{borderColor:'cyan',color:'cyan',padding:'0.25rem 0.5rem'}} className="hover:bg-cyan-600/20"><KeyRound className="w-3.5 h-3.5 mr-1"/>Permisos</Button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : ( <div className="text-center p-10"><p className="text-xl text-gray-400">No hay perfiles para mostrar.</p></div> )}
          </div>
        )}
        {/* Fallback for when initial loading is done, no errors, but user cannot view perfiles (already handled by Access Denied screen, but as a safety net) */}
        {!loading && !error && !permissionsError && !canViewPerfilesPage && status === 'authenticated' && (
             <div className="text-center p-10"><p className="text-xl text-gray-400">No tiene los permisos necesarios para ver el contenido de esta página.</p></div>
        )}
      </main>
    </div>
  );
}
