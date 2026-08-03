import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login', error: '/login' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({ where: { email: credentials.email as string } })
        if (!user || !user.passwordHash) return null
        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash)
        if (!valid) return null
        if (!user.emailVerified) throw new Error('Please verify your email before logging in.')
        return { id: user.id, email: user.email, name: user.name, image: user.image }
      },
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      // Allow all Google sign-ins — new users are auto-created by PrismaAdapter,
      // existing users are simply signed in. No intent-cookie guard needed.
      if (account?.provider === 'google') return true
      return true
    },
    async jwt({ token, user, trigger }) {
      if (user) token.userId = user.id
      // Always hydrate creditBalance if it's missing (e.g. first login of a new account)
      if (trigger === 'signIn' || trigger === 'update' || token.creditBalance === undefined) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.userId as string } })
        if (dbUser) token.creditBalance = dbUser.creditBalance
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string
        session.user.creditBalance = (token.creditBalance as number) ?? 0
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
      await prisma.user.update({
        where: { id: user.id! },
        data: { creditBalance: 3, emailVerified: new Date() },
      })
    },
  },
})
