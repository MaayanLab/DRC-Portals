import { PrismaAdapter } from '@auth/prisma-adapter'
import { NextAuthOptions } from 'next-auth'
import prisma from '@/lib/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import EmailProvider from 'next-auth/providers/email'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import ORCIDProvider from '@/lib/auth/providers/orcid'
import type { OAuthConfig } from 'next-auth/providers/index'

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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: 'jwt' },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      else if (new URL(url).origin === 'https://cfde.info') return url
      else if (new URL(url).origin === 'https://cfde.cloud') return url
      else return baseUrl
    }
  },
}
