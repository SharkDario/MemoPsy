// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };
/*
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UsuarioEntity } from "@/entities"; // Ajusta la ruta a tus entidades
import { initializeDatabase } from '@/lib/database';
// import { getDbConnection } from "@/lib/database"; // Necesitarás tu función de conexión a DB
import bcrypt from 'bcrypt';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "tu@email.com" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Credenciales incompletas");
          return null;
        }

        const db = await initializeDatabase(); // Obtén conexión DB
        const userRepository = db.getRepository(UsuarioEntity);

        try {
          const user = await userRepository.findOne({ where: { email: credentials.email } });

          if (user) {
            console.log(`Usuario encontrado: ${user.email}`);
            // Verificar contraseña
            const isValid = await bcrypt.compare(credentials.password, user.password); // user.password debe ser el hash de la DB

            if (isValid) {
              console.log("Contraseña válida");
              // Retorna el objeto usuario que se guardará en el token JWT
              // Solo incluye lo necesario y seguro para el cliente
              return { 
                id: user.id,
                email: user.email,
                personaId: user.personaId, 
                perfilId: user.perfilId,
                activo: user.activo,
                };
            } else {
              console.log("Contraseña inválida");
              return null; // Contraseña incorrecta
            }
          } else {
            console.log(`Usuario no encontrado: ${credentials.email}`);
            return null; // Usuario no encontrado
          }
        } catch (error) {
            console.error("Error en authorize:", error);
            return null; // Error durante la búsqueda
        }
      },
    }),
  ],
  pages: {
    signIn: "/login", // Tu página de login personalizada
    // error: '/auth/error', // (Opcional) Página para mostrar errores de auth
  },
  session: {
     strategy: "jwt", // Usar JWT para sesiones
  },
  callbacks: {
      // Añade datos al token JWT
      async jwt({ token, user }) {
          if (user) {
              token.id = user.id;
              token.email = user.email;
              token.personaId = user.personaId;
              token.perfilId = user.perfilId;
              token.activo = user.activo;
          }
          return token;
      },
      // Añade datos del token a la sesión del cliente
      async session({ session, token }) {
          if (session.user) {
            session.user.id = token.id;
            session.user.email = token.email;
            session.user.personaId = token.personaId;
            session.user.perfilId = token.perfilId;
            session.user.activo = token.activo;
          }
          return session;
      }
  },
  secret: process.env.NEXTAUTH_SECRET, // ¡MUY IMPORTANTE! Debe estar en .env.local
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
*/