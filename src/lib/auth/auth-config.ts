// lib/auth/auth-config.ts
import { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { UsuarioService, 
    UsuarioTienePerfilService, 
    PerfilTienePermisoService, 
    PerfilService, 
    PermisoService } from '@/services/index';
import { UsuarioRepository, 
    PersonaRepository, 
    UsuarioTienePerfilRepository, 
    PerfilRepository, 
    PerfilTienePermisoRepository, 
    PermisoRepository,
    ModuloRepository,
    AccionRepository } from '@/repositories/index';
import { JWT } from 'next-auth/jwt';
// Inicializar servicios (esto debería venir de tu contenedor de dependencias)
import { AppDataSource } from '@/lib/database';

const usuarioRepository = new UsuarioRepository(AppDataSource);
const personaRepository = new PersonaRepository(AppDataSource);
const usuarioTienePerfilRepository = new UsuarioTienePerfilRepository(AppDataSource);
const perfilRepository = new PerfilRepository(AppDataSource);
const perfilTienePermisoRepository = new PerfilTienePermisoRepository(AppDataSource);
const permisoRepository = new PermisoRepository(AppDataSource);
const moduloRepository = new ModuloRepository(AppDataSource);
const accionRepository = new AccionRepository(AppDataSource);

const perfilService = new PerfilService(perfilRepository);
const permisoService = new PermisoService(permisoRepository, moduloRepository, accionRepository);
const usuarioService = new UsuarioService(usuarioRepository, personaRepository);
const usuarioTienePerfilService = new UsuarioTienePerfilService(
  usuarioTienePerfilRepository,
  usuarioService,
  perfilService
);
const perfilTienePermisoService = new PerfilTienePermisoService(
  perfilTienePermisoRepository,
  perfilService,
  permisoService
);

declare module 'next-auth' {
  interface User {
    activo: boolean;
    persona: any;
    perfiles: any[];
    permisos: any[];
  }
}

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const loginResult = await usuarioService.loginUsuario({
            email: credentials.email,
            password: credentials.password
          });

          if (!loginResult.usuario) {
            return null;
          }

          // Obtener perfiles del usuario
          const perfiles = await usuarioTienePerfilService.obtenerPerfilesDeUsuario(
            loginResult.usuario.id
          );

          // Obtener permisos de todos los perfiles
          const permisos = [];
          for (const perfilRelacion of perfiles) {
            const permisosDelPerfil = await perfilTienePermisoService.obtenerPermisosDePerfil(
              perfilRelacion.perfilId
            );
            permisos.push(...permisosDelPerfil.map(p => p.permiso));
          }

          // Eliminar permisos duplicados
          const permisosUnicos = permisos.filter((permiso, index, self) => 
            index === self.findIndex(p => p.id === permiso.id)
          );

          return {
            id: loginResult.usuario.id,
            email: loginResult.usuario.email,
            activo: loginResult.usuario.activo,
            persona: loginResult.usuario.persona,
            perfiles: perfiles.map(p => p.perfil),
            permisos: permisosUnicos
          };
        } catch (error) {
          console.error('Error durante la autenticación:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.activo = user.activo;
        token.persona = user.persona;
        token.perfiles = user.perfiles;
        token.permisos = user.permisos;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.activo = token.activo as boolean;
        session.user.persona = token.persona;
        session.user.perfiles = token.perfiles as any[];
        session.user.permisos = token.permisos as any[];
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET
};