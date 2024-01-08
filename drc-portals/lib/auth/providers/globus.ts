import type { OAuthConfig, OAuthUserConfig } from 'next-auth/providers/index'

export default function GlobusProvider<P extends { sub: string, name: string, email: string }>(options: OAuthUserConfig<P>): OAuthConfig<P> {
  return {
    id: 'globus',
    name: 'Globus',
    type: 'oauth',
    wellKnown: "https://auth.globus.org/.well-known/openid-configuration",
    authorization: { params: { scope: "openid email profile" } },
    idToken: true,
    checks: ["pkce", "state"],
    client: {
        authorization_signed_response_alg: 'RS512',
        id_token_signed_response_alg: 'RS512'
    },
    async profile(profile, tokens) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
      }
    },
    style: {
      logo: 'https://www.globus.org/assets/images/logo_globus-solid.svg',
      logoDark: 'https://www.globus.org/assets/images/logo_globus-solid.svg',
      bgDark: "#fff",
      bg: "#fff",
      text: "#000",
      textDark: "#000",
    },
    options,
  }
}
