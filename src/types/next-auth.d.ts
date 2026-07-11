import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      creditBalance: number
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string
    creditBalance: number
  }
}
