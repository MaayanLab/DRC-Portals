import prisma from '@/lib/prisma'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { AdapterAccount } from 'next-auth/adapters'

export default function PrismaAdapterEx() {
  return {
    ...PrismaAdapter(prisma),
    async linkAccount(data: AdapterAccount) {
      const {
        access_token,
        expires_at,
        id_token,
        provider,
        providerAccountId,
        refresh_token,
        scope,
        session_state,
        token_type,
        type,
        userId,
      } = data
      const account = await prisma.account.create({
        data: {
          access_token,
          expires_at,
          id_token,
          provider,
          providerAccountId,
          refresh_token,
          scope,
          session_state,
          token_type,
          type,
          userId,
        }
      })
      return account as AdapterAccount
    }
  }
}
