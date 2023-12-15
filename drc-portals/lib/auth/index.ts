import { DefaultSession, NextAuthOptions } from 'next-auth'
import prisma from '@/lib/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import EmailProvider from 'next-auth/providers/email'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import ORCIDProvider from '@/lib/auth/providers/orcid'
import type { OAuthConfig } from 'next-auth/providers/index'
import PrismaAdapterEx from './adapters/prisma'


declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}

const providers = [
  /* In development, we'll add a button for creating a random user */
  process.env.NODE_ENV === 'development' ? CredentialsProvider({
    name: 'Developer Account',
    credentials: {},
    async authorize(credentials, req) {
      const user = await prisma.user.upsert({
        create: {
          id: process.env.NEXTAUTH_SECRET ?? '',
          name: 'Developer',
        },
        where: {
          id: process.env.NEXTAUTH_SECRET ?? '',
        },
        update: {},
      })
      return user
    }
  }) : undefined,
  process.env.NEXTAUTH_EMAIL ? EmailProvider(JSON.parse(process.env.NEXTAUTH_EMAIL)) : undefined,
  process.env.NEXTAUTH_GITHUB ? GithubProvider(JSON.parse(process.env.NEXTAUTH_GITHUB)) : undefined,
  process.env.NEXTAUTH_GOOGLE ? GoogleProvider(JSON.parse(process.env.NEXTAUTH_GOOGLE)) : undefined,
  process.env.NEXTAUTH_ORCID ? ORCIDProvider(JSON.parse(process.env.NEXTAUTH_ORCID)) : undefined,
].filter((v): v is OAuthConfig<any> => v !== undefined)

const useSecureCookies = !!process.env.NEXTAUTH_URL?.startsWith("https://")
const cookiePrefix = useSecureCookies ? "__Secure-" : "" 
const hostName = process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).hostname : 'cfde.cloud'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapterEx(),
  providers,
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        // Persist the OAuth access_token and or the user id to the token right after signin
        token.id = user?.id
      }
      return token
    },
    session({ session, token}) {
      // session.accessToken = token.accessToken
      const id = token.sub ?? token.id
      if (typeof id !== 'string') throw new Error('Missing user id')
      session.user.id = id
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      else if (new URL(url).origin === 'cfde.cloud') return url
      else if (new URL(url).origin.endsWith('.cfde.cloud')) return url
      else return baseUrl
    }
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        domain: "." + hostName,
        secure: useSecureCookies,
      },
    },
  },
}
