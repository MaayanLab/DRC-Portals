import prisma from "@/lib/prisma";
import { jwtDecode } from "jwt-decode";
import { z } from 'zod'


export async function getAllKeycloakUsers() {
  const usersInDb = await prisma.user.findMany({
    include: {
      accounts: true,
    },
  })
  const parsedUserArray = []
  for (let user of usersInDb) {
    for (const account of user?.accounts ?? []) {
      if (!account.access_token) continue
      try {
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
        const dccs = roleParsed.resource_access["DRC-Portal"].roles.filter(role => role.startsWith('dcc:')).map(role => role.slice('dcc:'.length)).filter((dcc) => dcc !== '*')
        parsedUserArray.push({
          name: roleParsed.name,
          email: roleParsed.email,
          roles,
          dccs,
        })
      } catch {
        continue
      }

    }
  }
  return parsedUserArray
}
