import type { OAuthConfig, OAuthUserConfig } from 'next-auth/providers/index'

export default function GlobusProvider<P extends { sub: string, name: string, email: string, avatar_url: string }>(options: OAuthUserConfig<P>): OAuthConfig<P> {
  return {
    id: 'globus',
    name: 'Globus',
    type: 'oauth',
    wellKnown: "https://auth.globus.org/.well-known/openid-configuration",
    authorization: { params: { scope: "openid profile offline_access email" } },
    idToken: true,
    checks: ["pkce", "state"],
    async profile(profile, tokens) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.avatar_url,
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
