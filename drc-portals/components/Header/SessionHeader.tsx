import Header from '@/components/Header'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceStatus } from '@/lib/service-status'

export default async function SessionHeader() {
  const status = await getServiceStatus()
  const session = status.primary
    ? await getServerSession(authOptions).catch(error => {
        console.error('Unable to load session', error)
        return null
      })
    : null
  return <Header session={session} />
}
