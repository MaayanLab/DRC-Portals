import { User } from "next-auth";
import prisma from "@/lib/prisma";
import { jwtDecode } from "jwt-decode";
import { z } from 'zod'

export default async function getKeycloakInfo(user: User) {
  const userInDb = await prisma.user.findUnique({
    where: {
      id: user.id,
      accounts: {
        every: {
          provider: 'keycloak',
        },
      },
    },
    include: {
      accounts: true,
    },
  })
  for (const account of userInDb?.accounts ?? []) {
    if (!account.access_token) continue
    const roleParsed = z.object({
      iss: z.literal('https://auth.cfde.cloud/realms/cfde'),
      name: z.string(),
      email: z.string(),
      resource_access: z.object({
        'DRC-Portal': z.object({
          roles: z.string().array(),
        }),
      }),
    }).parse(jwtDecode(account.access_token))
    const roles = roleParsed.resource_access["DRC-Portal"].roles.filter(role => role.startsWith('role:')).map(role => role.slice('role:'.length))
    const dccs = roleParsed.resource_access["DRC-Portal"].roles.filter(role => role.startsWith('dcc:')).map(role => role.slice('dcc:'.length))
    return {
      name: roleParsed.name,
      email: roleParsed.email,
      roles,
      dccs,
    }
  }
}
