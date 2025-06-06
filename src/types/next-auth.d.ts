import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name?: string
    perfilId?: string
    tipo?: string
  }

  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    perfilId?: string
    tipo?: string
  }
}

