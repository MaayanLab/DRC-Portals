import { z } from 'zod'
import prisma from '@/lib/prisma'
import { $Enums } from '@prisma/client'

function reduce_role(roles: string[]) {
  if (roles.includes('ADMIN')) return 'ADMIN'
  else if (roles.includes('DRC_APPROVER')) return 'DRC_APPROVER'
  else if (roles.includes('DCC_APPROVER')) return 'DCC_APPROVER'
  else if (roles.includes('UPLOADER')) return 'UPLOADER'
  else if (roles.includes('READONLY')) return 'READONLY'
  else return 'USER'
}

function ensure_email<T extends { email: string | null }>({ email, ...rest }: T) {
  if (email === null) throw new Error('Email must be present')
  return { email: email as string, ...rest }
}

export async function keycloak_pull({ id, userAccessToken }: { id: string, userAccessToken: string }) {
  const req = await fetch(`https://auth.cfde.cloud/realms/cfde/protocol/openid-connect/userinfo`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${userAccessToken}`,
    },
  })
  if (req.ok) {
    const keycloakUserInfo = await z.object({
      name: z.string(),
      given_name: z.string(),
      family_name: z.string(),
      email: z.string(),
      preferred_username: z.string(),
      resource_access: z.object({
        'cfde-workbench': z.object({
          roles: z.string().array(),
        }).passthrough(),
      }).passthrough(),
    }).transform(({ resource_access, ...rest }) => ({
      ...rest,
      resource_access,
      roles: resource_access["cfde-workbench"].roles.filter(role => role.startsWith('role:')).map(role => role.slice('role:'.length)),
      dccs: resource_access["cfde-workbench"].roles.filter(role => role.startsWith('dcc:')).map(role => role.slice('dcc:'.length)).filter((dcc) => dcc !== '*'), })
    ).parseAsync(await req.json())
    const userRole = reduce_role(keycloakUserInfo.roles)
    const userDccs = await prisma.dCC.findMany({
      select: { id: true },
      where: { short_label: { in: keycloakUserInfo.dccs } }
    })
    const userInfo = await prisma.user.update({
      where: { id },
      select: {
        name: true,
        email: true,
        role: true,
        dccs: {
          select: {
            short_label: true,
          },
        },
        accounts: {
          select: {
            providerAccountId: true,
          },
          where: {
            provider: 'keycloak',
          },
        },
      },
      data: {
        name: keycloakUserInfo.name,
        // email: keycloakUserInfo.email,
        role: userRole,
        dccs: {
          set: userDccs,
        },
      },
    })
    return userInfo
  } else if (req.status === 404) {
    const userInfo = await prisma.user.findUniqueOrThrow({
      where: { id },
      select: {
        name: true,
        email: true,
        role: true,
        dccs: {
          select: {
            short_label: true,
          },
        },
        accounts: {
          select: {
            providerAccountId: true,
          },
          where: {
            provider: 'keycloak',
          },
        },
      },
    })
    await keycloak_push({ userInfo })
    return userInfo
  } else if (req.status === 401) {
    throw new Error(`Permission Denied`)
  }
  throw new Error(`Unhandled status ${req.status}`)
}

export async function keycloak_client_uid({ accessToken }: { accessToken: string }) {
  const { clientId } = keycloak_config()
  const req = await fetch(`https://auth.cfde.cloud/admin/realms/cfde/clients?first=0&max=1&clientId=${clientId}&exact=true`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const res = await req.json()
  return res[0]['id']
}

export async function keycloak_client_roles({ clientUid, accessToken }: { clientUid: string, accessToken: string }) {
  const req = await fetch(`https://auth.cfde.cloud/admin/realms/cfde/clients/${clientUid}/roles`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const res = await req.json()
  const client_roles = {} as Record<string, { id: string, name: string }>
  for (const item of res) {
    client_roles[item.name] = { id: item.id, name: item.name }
  }
  return client_roles
}

export function keycloak_name_split(name: string | null) {
  let firstName: string
  let lastName: string 
  if (name) {
    const lastSpace = name.lastIndexOf(' ')
    if (lastSpace === -1) {
      firstName = name
      lastName = ''
    } else {
      firstName = name.slice(0, lastSpace)
      lastName = name.slice(lastSpace+1)
    }
  } else {
    firstName = ''
    lastName = ''
  }
  return { firstName, lastName }
}

export async function keycloak_user_find<USER_INFO extends { accounts: { providerAccountId: string }[] }>({ userInfo, accessToken }: { userInfo: USER_INFO, accessToken: string }) {
  // const params = new URLSearchParams()
  // params.append('email', userInfo.email)
  // params.append('exact', 'true')
  // const req = await fetch(`https://auth.cfde.cloud/admin/realms/cfde/users?${params.toString()}`, {
  //   headers: {
  //     Accept: 'application/json',
  //     Authorization: `Bearer ${accessToken}`,
  //   },
  // })
  // if (!req.ok) throw new Error('Failed to get userId')
  // const res = await req.json()
  // return await res[0]
  const req = await fetch(`https://auth.cfde.cloud/admin/realms/cfde/users/${userInfo.accounts[0].providerAccountId}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  if (!req.ok) throw new Error('Failed to get userId')
  return await req.json()
}


export async function keycloak_user_roles<KEYCLOAK_INFO extends { id: string }>({ keycloakUserInfo, clientUid, accessToken }: { keycloakUserInfo: KEYCLOAK_INFO, clientUid: string, accessToken: string }) {
  const req = await fetch(`https://auth.cfde.cloud/admin/realms/cfde/users/${keycloakUserInfo['id']}/role-mappings/clients/${clientUid}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const res = await req.json()
  const user_roles = {} as Record<string, { id: string, name: string }>
  for (const item of res) {
    user_roles[item.name] = { id: item.id, name: item.name }
  }
  return user_roles
}

export async function keycloak_client_role_post({ role, clientUid, accessToken }: { role: string, clientUid: string, accessToken: string }){
  const req = await fetch(`https://auth.cfde.cloud/admin/realms/cfde/clients/${clientUid}/roles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({"description":'', 'name': role, 'attributes': {}})
  })
  if (!req.ok) throw new Error('Failed to register role')
  const req2 = await fetch(`https://auth.cfde.cloud/admin/realms/cfde/clients/${clientUid}/roles/${role}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const { id, name } = await req2.json()
  return { id: id as string, name: name as string }
}

export async function keycloak_user_roles_put<KEYCLOAK_INFO extends { id: string, email: string }>({ keycloakUserInfo, roles, accessToken }: { keycloakUserInfo: KEYCLOAK_INFO, roles: string[], accessToken: string }) {
  const clientUid = await keycloak_client_uid({ accessToken })
  const clientRoles = await keycloak_client_roles({ clientUid, accessToken })
  const keycloakUserRoles = await keycloak_user_roles({ keycloakUserInfo, clientUid, accessToken })
  const results = await Promise.all([
    // add missing roles
    ...roles.filter(role => keycloakUserRoles[role] === undefined).map(async (role) => {
      if (!(role in clientRoles)) {
        clientRoles[role] = await keycloak_client_role_post({ role, clientUid, accessToken })
      }
      const req = await fetch(`https://auth.cfde.cloud/admin/realms/cfde/users/${keycloakUserInfo['id']}/role-mappings/clients/${clientUid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify([clientRoles[role]]),
      })
      return { role, status: req.status }
    }),
    // remove stale roles
    ...Object.keys(keycloakUserRoles).filter(role => !roles.includes(role)).map(async (role) => {
      const req = await fetch(`https://auth.cfde.cloud/admin/realms/cfde/users/${keycloakUserInfo['id']}/role-mappings/clients/${clientUid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify([clientRoles[role]]),
      })
      return { role, status: req.status }
    }),
  ])
  results.filter(({ status }) => status > 400).forEach(({ role, status }) => {
    console.warn(`Failed to update user ${keycloakUserInfo.email} role ${role}: status code ${status}`)
  })
}

export async function keycloak_user_put<KEYCLOAK_INFO extends { id: string }, USER_INFO extends { name: string | null, email: string }>({ keycloakUserInfo, userInfo, accessToken }: { keycloakUserInfo: KEYCLOAK_INFO, userInfo: USER_INFO, accessToken: string }) {
  const {firstName, lastName} = keycloak_name_split(userInfo.name)
  const req = await fetch(`https://auth.cfde.cloud/admin/realms/cfde/users/${keycloakUserInfo['id']}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      ...keycloakUserInfo,
      firstName,
      lastName,
    }),
  })
  if (!req.ok) console.warn(`Failed to update user profile ${userInfo.email}`)
}

export function keycloak_config() {
  const { issuer, clientId, clientSecret } = JSON.parse(process.env.NEXTAUTH_KEYCLOAK ?? '{}')
  return { issuer, clientId, clientSecret }
}

export async function keycloak_access_token() {
  const { clientId, clientSecret } = keycloak_config()
  const body = new URLSearchParams()
  body.append("grant_type", "client_credentials")
  const req = await fetch(`https://auth.cfde.cloud/realms/cfde/protocol/openid-connect/token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body,
  })
  const res = await req.json()
  return res["access_token"]
}

export async function keycloak_push<USER_INFO extends {
  name: string | null;
  email: string | null;
  role: $Enums.Role;
  dccs: {
      short_label: string | null;
  }[];
  accounts: { providerAccountId: string }[],
}>({ userInfo: userInfoRaw }: { userInfo: USER_INFO }) {
  const userInfo = ensure_email(userInfoRaw)
  const accessToken = await keycloak_access_token()
  const keycloakUserInfo = await keycloak_user_find({ userInfo, accessToken })
  await keycloak_user_put({ keycloakUserInfo, userInfo, accessToken })
  await keycloak_user_roles_put({ keycloakUserInfo, roles: [
    ...userInfo.dccs.map(dcc => `dcc:${dcc.short_label}`),
    `role:${userInfo.role.toString()}`,
  ], accessToken })
}
