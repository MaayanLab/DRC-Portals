import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextApiRequest, NextApiResponse } from 'next'

// const handler = NextAuth(authOptions)
// export { handler as GET, handler as POST }

async function auth(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === "HEAD") {
        return res.status(200).end()
    }
    return await NextAuth(req, res, authOptions)
  }

  export { auth as GET, auth as POST }