// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withAuth(
  function middleware(request: NextRequest) {
    const token = request.cookies.get('next-auth.session-token')?.value || request.cookies.get('__Secure-next-auth.session-token')?.value;
    const { pathname } = request.nextUrl;

    // Si no hay token y está intentando acceder a rutas protegidas
    if (!token && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Si hay token pero el usuario está inactivo
    if (token && !JSON.parse(token).activo && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth/inactive', request.url));
    }

    // Verificar permisos para rutas específicas de API
    if (pathname.startsWith('/api/') && token) {
      // Rutas que requieren permisos específicos
      const routePermissions = {
        '/api/usuarios': {
          GET: { modulo: 'Usuarios', accion: 'Ver' },
          POST: { modulo: 'Usuarios', accion: 'Crear' }
        }
      };

      // Obtener el método HTTP
      const method = request.method;
      
      // Verificar si la ruta requiere permisos específicos
      for (const [route, permissions] of Object.entries(routePermissions)) {
        if (pathname.startsWith(route)) {
          const requiredPermission = permissions[method as keyof typeof permissions];
          
          if (requiredPermission) {
            const hasPermission = JSON.parse(token).permisos?.some(
              (permiso: any) => 
                permiso.modulo.nombre === requiredPermission.modulo && 
                permiso.accion.nombre === requiredPermission.accion
            );

            if (!hasPermission) {
              return NextResponse.json(
                { error: 'No tienes permisos para realizar esta acción' },
                { status: 403 }
              );
            }
          }
        }
      }
    }

    // Verificar permisos para rutas del dashboard
    if (pathname.startsWith('/dashboard') && token) {
      const routePermissions = {
        '/dashboard/usuarios': { modulo: 'Usuarios', accion: 'Ver' },
        '/dashboard/perfiles': { modulo: 'Perfiles', accion: 'Ver' },
        '/dashboard/permisos': { modulo: 'Permisos', accion: 'Ver' },
        '/dashboard/admin': { modulo: 'Administracion', accion: 'Ver' }
      };

      // Verificar si la ruta requiere permisos específicos
      for (const [route, permission] of Object.entries(routePermissions)) {
        if (pathname.startsWith(route)) {
          const parsedToken = JSON.parse(token);
          const hasPermission = parsedToken.permisos?.some(
            (permiso: any) => 
              permiso.modulo.nombre === permission.modulo && 
              permiso.accion.nombre === permission.accion
          );

          if (!hasPermission) {
            return NextResponse.redirect(new URL('/dashboard/unauthorized', request.url));
          }
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Permitir acceso a rutas públicas
        if (
          pathname.startsWith('/auth/') ||
          pathname === '/' ||
          pathname.startsWith('/api/auth/') ||
          pathname.startsWith('/_next/') ||
          pathname.startsWith('/favicon.ico')
        ) {
          return true;
        }

        // Para rutas protegidas, requerir token
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/')) {
          return !!token;
        }

        return true;
      }
    }
  }
);

export const config = {
  matcher: [
    /*
     * Aplicar el middleware a todas las rutas excepto:
     * - api/auth/* (rutas de autenticación de NextAuth)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     * - archivos públicos con extensiones comunes
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

/*
1. Protección de rutas

Rutas públicas: /, /auth/*, archivos estáticos
Rutas protegidas: /dashboard/*, /api/* (excepto /api/auth/*)

2. Verificación de usuario activo

Redirige a /auth/inactive si el usuario está desactivado

3. Control de permisos por rutas

Dashboard: Verifica permisos específicos por módulo
API: Controla acceso según método HTTP y permisos requeridos

4. Redirecciones automáticas

Sin autenticación → /auth/signin
Usuario inactivo → /auth/inactive
Sin permisos → /dashboard/unauthorized

Para que el middleware funcione completamente:

src/app/auth/inactive/page.tsx - Para usuarios desactivados
src/app/dashboard/unauthorized/page.tsx - Para usuarios sin permisos
src/app/auth/signin/page.tsx - Página de login (si no la tienes)
*/

/*
// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withAuth(
  function middleware(request: NextRequest) {
    const tokenString = request.cookies.get('next-auth.session-token')?.value || request.cookies.get('__Secure-next-auth.session-token')?.value;
    const { pathname } = request.nextUrl;
    let parsedToken: any = null; 

    if (tokenString) {
      try {
        parsedToken = JSON.parse(tokenString);
      } catch (error) {
        console.error("Error parsing token:", error);
        // Potentially redirect to signin or error page if token is malformed
        return NextResponse.redirect(new URL('/auth/signin', request.url)); 
      }
    }

    // Si no hay token y está intentando acceder a rutas protegidas
    if (!parsedToken && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Si hay token pero el usuario está inactivo
    if (parsedToken && !parsedToken.activo && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth/inactive', request.url));
    }

    // Verificar permisos para rutas específicas de API
    if (pathname.startsWith('/api/') && parsedToken) {
      // Rutas que requieren permisos específicos
      const apiRoutePermissions = {
        '/api/usuarios': {
          GET: { modulo: 'Usuarios', accion: 'Ver' },
          POST: { modulo: 'Usuarios', accion: 'Crear' },
          PUT: { modulo: 'Usuarios', accion: 'Editar' },
          DELETE: { modulo: 'Usuarios', accion: 'Eliminar' }
        },
        '/api/perfiles': { // Example for another module
          GET: { modulo: 'Perfiles', accion: 'Ver' },
          POST: { modulo: 'Perfiles', accion: 'Crear' },
          PUT: { modulo: 'Perfiles', accion: 'Editar' },
          DELETE: { modulo: 'Perfiles', accion: 'Eliminar' }
        }
        // Add other API modules/actions here if you have more definitions ready
      };

      // Obtener el método HTTP
      const method = request.method;
      
      // Verificar si la ruta requiere permisos específicos
      for (const [route, permissions] of Object.entries(apiRoutePermissions)) {
        if (pathname.startsWith(route)) {
          const requiredPermission = permissions[method as keyof typeof permissions];
          
          if (requiredPermission) {
            const hasPermission = parsedToken.permisos?.some(
              (permiso: any) => 
                permiso.modulo.nombre === requiredPermission.modulo && 
                permiso.accion.nombre === requiredPermission.accion
            );

            if (!hasPermission) {
              return NextResponse.json(
                { error: 'No tienes permisos para realizar esta acción' },
                { status: 403 }
              );
            }
          }
        }
      }
    }

    // Verificar permisos para rutas del dashboard
    if (pathname.startsWith('/dashboard') && parsedToken) {
      const dashboardRoutePermissions = {
        '/dashboard/usuarios': { modulo: 'Usuarios', accion: 'Ver' },
        '/dashboard/perfiles': { modulo: 'Perfiles', accion: 'Ver' },
        '/dashboard/permisos': { modulo: 'Permisos', accion: 'Ver' },
        '/dashboard/admin': { modulo: 'Administracion', accion: 'Ver' }
        // Add other dashboard sections here if needed
      };

      // Verificar si la ruta requiere permisos específicos
      for (const [route, permission] of Object.entries(dashboardRoutePermissions)) {
        if (pathname.startsWith(route)) {
          const hasPermission = parsedToken.permisos?.some(
            (permiso: any) => 
              permiso.modulo.nombre === permission.modulo && 
              permiso.accion.nombre === permission.accion
          );

          if (!hasPermission) {
            return NextResponse.redirect(new URL('/dashboard/unauthorized', request.url));
          }
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Permitir acceso a rutas públicas
        if (
          pathname.startsWith('/auth/') ||
          pathname === '/' ||
          pathname.startsWith('/api/auth/') ||
          pathname.startsWith('/_next/') ||
          pathname.startsWith('/favicon.ico')
        ) {
          return true;
        }

        // Para rutas protegidas, requerir token
        // Note: 'token' here is the decoded JWT from next-auth, not the raw string
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/')) {
          return !!token; // !!token checks if the decoded token object exists
        }

        return true;
      }
    }
  }
);

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
*/