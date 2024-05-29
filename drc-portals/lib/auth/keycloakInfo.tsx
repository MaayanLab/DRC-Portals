import { z } from 'zod'

export async function getKeycloakConfig() {
  if (!process.env.NEXTAUTH_KEYCLOAK) throw new Error('NEXTAUTH_KEYCLOAK not present')
  return z.object({ clientId: z.string(), clientSecret: z.string() }).parse(JSON.parse(process.env.NEXTAUTH_KEYCLOAK))
}

export async function getPortalKeycloakAccessToken() {
  const config = await getKeycloakConfig()
  const formData = new FormData()
  formData.set('grant_type', 'client_credentials')
  const req = await fetch('https://auth.cfde.cloud/realms/cfde/protocol/openid-connect/token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`,
    },
    body: formData,
    next: { revalidate: 300 },
  })
  if (!req.ok) throw new Error(`Keycloak access token request returned ${req.status}`)
  return z.object({
    access_token: z.string(),
    token_type: z.string(),
  }).parse(await req.json())
}

export async function getKeycloakPortalClientInfo() {
  const [access, config] = await Promise.all([
    getPortalKeycloakAccessToken(), getKeycloakConfig(),
  ])
  const params = new URLSearchParams()
  params.set('clientId', config.clientId)
  params.set('exact', 'true')
  const req = await fetch(`https://auth.cfde.cloud/admin/realms/cfde/clients?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
      'Authorization': `${access.token_type} ${access.access_token}`,
    },
    next: { revalidate: 3600 },
  })
  const [clientInfo] = z.object({
    id: z.string(),
    name: z.string(),
  }).array().length(1).parse(await req.json())
  return clientInfo
}

export async function getKeycloakUsersWithDRCRole(role: string) {
  const access = await getPortalKeycloakAccessToken()
  const req = await fetch(`https://auth.cfde.cloud/admin/realms/cfde/clients/c2226db3-141b-4c17-836d-65a2088196a7/roles/${encodeURIComponent(role)}/users`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `${access.token_type} ${access.access_token}`,
    },
  })
  return z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string().default(''),
    lastName: z.string().default(''),
  }).transform(({ id, email, firstName, lastName }) => ({ id, email, name: `${firstName} ${lastName}`})).array().parse(await req.json())
}

export async function getKeycloakUserRoles(userId: string) {
  const [access, clientInfo] = await Promise.all([
    getPortalKeycloakAccessToken(), getKeycloakPortalClientInfo(),
  ])
  const req = await fetch(`https://auth.cfde.cloud/admin/realms/cfde/users/${userId}/role-mappings/clients/${clientInfo.id}/composite`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `${access.token_type} ${access.access_token}`,
    }
  })
  const effectiveRoles = z.object({
    role: z.string(),
    client: z.string(),
  }).array().parse(await req.json()).filter(({ client }) => client === 'DRC-Portal')
  const roles = effectiveRoles.filter(({ role }) => role.startsWith('role:')).map(({ role }) => role.slice('role:'.length))
  const dccs = effectiveRoles.filter(({ role }) => role.startsWith('dcc:')).map(({ role }) => role.slice('dcc:'.length)).filter((dcc) => dcc !== '*')
  return {
    roles,
    dccs,
  }
}

export async function getKeycloakUserInfo(email: string) {
  const access = await getPortalKeycloakAccessToken()
  const params = new URLSearchParams()
  params.set('email', email)
  params.set('exact', 'true')
  const req = await fetch(`https://auth.cfde.cloud/admin/realms/cfde/users?${params.toString()}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `${access.token_type} ${access.access_token}`,
    },
  })
  const [userInfo] = z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string().default(''),
    lastName: z.string().default(''),
  }).transform(({ id, email, firstName, lastName }) => ({ id, email, name: `${firstName} ${lastName}`})).array().length(1).parse(await req.json())
  return userInfo
}
