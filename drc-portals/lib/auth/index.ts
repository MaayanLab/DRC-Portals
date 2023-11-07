import { PrismaAdapter } from '@auth/prisma-adapter'
import { NextAuthOptions } from 'next-auth'
import prisma from '@/lib/prisma'
import EmailProvider from 'next-auth/providers/email'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import ORCIDProvider from '@/lib/auth/providers/orcid'
import type { OAuthConfig } from 'next-auth/providers/index'

const providers = [
  process.env.NEXTAUTH_EMAIL ? EmailProvider(JSON.parse(process.env.NEXTAUTH_EMAIL)) : undefined,
  process.env.NEXTAUTH_GITHUB ? GithubProvider(JSON.parse(process.env.NEXTAUTH_GITHUB)) : undefined,
  process.env.NEXTAUTH_GOOGLE ? GoogleProvider(JSON.parse(process.env.NEXTAUTH_GOOGLE)) : undefined,
  process.env.NEXTAUTH_ORCID ? ORCIDProvider(JSON.parse(process.env.NEXTAUTH_ORCID)) : undefined,
].filter((v): v is OAuthConfig<any> => v !== undefined)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
}
