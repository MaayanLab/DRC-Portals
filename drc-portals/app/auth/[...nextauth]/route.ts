import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

async function HEAD(req: Request) {
    return new Response('', {
        status: 200,
    })
}

const handler = NextAuth(authOptions)
export { HEAD, handler as GET, handler as POST }
