import { DefaultSession, NextAuthOptions } from 'next-auth'
import prisma from '@/lib/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import KeycloakProvider from 'next-auth/providers/keycloak'
import EmailProvider from 'next-auth/providers/email'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import ORCIDProvider from '@/lib/auth/providers/orcid'
import GlobusProvider from '@/lib/auth/providers/globus'
import type { OAuthConfig } from 'next-auth/providers/index'
import PrismaAdapterEx from './adapters/prisma'
import { z } from 'zod'
import { jwtDecode } from "jwt-decode";

function parseKeycloakUserinfo(accessToken: string) {
  if (!accessToken) return
  const userInfo = jwtDecode(accessToken)
  console.log({ userInfo })
  const userInfoParsed = z.object({
    iss: z.literal('https://auth.cfde.cloud/realms/cfde'),
    name: z.string(),
    email: z.string(),
    resource_access: z.object({
      'DRC-Portal': z.object({
        roles: z.string().array(),
      }),
    }),
  }).safeParse(userInfo)
  if (!userInfoParsed.success) return
  const roles = userInfoParsed.data.resource_access["DRC-Portal"].roles.filter(role => role.startsWith('role:')).map(role => role.slice('role:'.length))
  const dccs = userInfoParsed.data.resource_access["DRC-Portal"].roles.filter(role => role.startsWith('dcc:')).map(role => role.slice('dcc:'.length))
  return {
    name: userInfoParsed.data.name,
    email: userInfoParsed.data.email,
    roles,
    dccs,
  }
}
type KeycloakUserInfo = ReturnType<typeof parseKeycloakUserinfo>

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
    keycloakInfo: KeycloakUserInfo
  }
}

const providers = [
  /* In development, we'll add a button for creating a random user */
  process.env.NODE_ENV === 'development' ? CredentialsProvider({
    name: 'Developer Account',
    credentials: {},
    async authorize(credentials, req) {
      const LINCSDCCObject = await prisma.dCC.findFirst({
        where: {
          short_label: 'LINCS'
        },
        select: {
          id: true
        }
      })

      const developerUser = await prisma.user.upsert({
        where: {
          id: process.env.NEXTAUTH_SECRET ?? '',
        },
        update: {
          name: 'Developer',
          role: 'ADMIN',
          email: 'test_developer@gmail.com',
          dccs: {
            connectOrCreate: {
              where: {
                id: LINCSDCCObject?.id
              },
              create: {
                id: LINCSDCCObject?.id,
                short_label: 'LINCS',
                label: 'Library of Integrated Network-based Cellular Signatures',
                homepage: 'https://lincsproject.org/'
              },
            },
          },
        },
        create: {
          id: process.env.NEXTAUTH_SECRET ?? '',
          name: 'Developer',
          role: 'ADMIN',
          email: 'test_developer@gmail.com',
          dccs: {
            connectOrCreate: {
              where: {
                id: LINCSDCCObject?.id
              },
              create: {
                id: LINCSDCCObject?.id,
                short_label: 'LINCS',
                label: 'Library of Integrated Network-based Cellular Signatures',
                homepage: 'https://lincsproject.org/'
              },
            },
          },
        }
      })
      return developerUser

    }
  }) : undefined,
  process.env.NEXTAUTH_KEYCLOAK ? KeycloakProvider(JSON.parse(process.env.NEXTAUTH_KEYCLOAK)) : undefined,
  process.env.NEXTAUTH_GITHUB ? GithubProvider(JSON.parse(process.env.NEXTAUTH_GITHUB)) : undefined,
  process.env.NEXTAUTH_GOOGLE ? GoogleProvider(JSON.parse(process.env.NEXTAUTH_GOOGLE)) : undefined,
  process.env.NEXTAUTH_ORCID ? ORCIDProvider(JSON.parse(process.env.NEXTAUTH_ORCID)) : undefined,
  process.env.NEXTAUTH_GLOBUS ? GlobusProvider(JSON.parse(process.env.NEXTAUTH_GLOBUS)) : undefined,
  process.env.NEXTAUTH_EMAIL ? EmailProvider(JSON.parse(process.env.NEXTAUTH_EMAIL)) : undefined,
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
        token.accessToken = account.access_token
      }
      return token
    },
    session({ session, token }) {
      const id = token.sub ?? token.id
      if (typeof id !== 'string') throw new Error('Missing user id')
      session.user.id = id
      session.keycloakInfo = parseKeycloakUserinfo(token.accessToken as string)
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
