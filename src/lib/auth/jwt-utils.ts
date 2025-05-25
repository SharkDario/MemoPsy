// lib/auth/jwt-utils.ts
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function getJwtPayload(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  return token;
}

export function hasPermission(
  userPermissions: Array<{
    modulo: { nombre: string };
    accion: { nombre: string };
  }>,
  moduloName: string,
  accionName: string
): boolean {
  return userPermissions.some(
    permiso => 
      permiso.modulo.nombre === moduloName && 
      permiso.accion.nombre === accionName
  );
}

export function hasAnyRole(
  userRoles: Array<{ nombre: string }>,
  roleNames: string[]
): boolean {
  return userRoles.some(role => roleNames.includes(role.nombre));
}