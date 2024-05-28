import { z } from 'zod'

export async function getPortalKeycloakAccessToken() {
  if (!process.env.NEXTAUTH_KEYCLOAK) throw new Error('NEXTAUTH_KEYCLOAK not present')
  const nextauth_keycloak = z.object({ clientId: z.string(), clientSecret: z.string() }).parse(JSON.parse(process.env.NEXTAUTH_KEYCLOAK))
  const formData = new FormData()
  formData.set('grant_type', 'client_credentials')
  const req = await fetch('https://auth.cfde.cloud/realms/cfde/protocol/openid-connect/token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${btoa(`${nextauth_keycloak.clientId}:${nextauth_keycloak.clientSecret}`)}`,
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


export async function getKeycloakUsersWithDRCRole(role: string) {
  const { access_token, token_type } = await getPortalKeycloakAccessToken()
  const req = await fetch(`https://auth.cfde.cloud/admin/realms/cfde/clients/c2226db3-141b-4c17-836d-65a2088196a7/roles/${encodeURIComponent(role)}/users`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `${token_type} ${access_token}`,
    },
  })
  return z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
  }).transform(({ id, email, firstName, lastName }) => ({ id, email, name: `${firstName} ${lastName}`})).array().parse(await req.json())
}

export async function getKeycloakUserRoles(userId: string) {
  const { access_token, token_type } = await getPortalKeycloakAccessToken()
  const req = await fetch(`https://auth.cfde.cloud/admin/realms/cfde/ui-ext/effective-roles/users/${userId}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `${token_type} ${access_token}`,
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
