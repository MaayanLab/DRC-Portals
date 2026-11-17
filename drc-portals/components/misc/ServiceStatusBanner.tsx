import { getServiceStatus } from '@/lib/service-status'
import ServiceInterruption from './ServiceInterruption'

export default async function ServiceStatusBanner() {
  const status = await getServiceStatus()
  return status.interrupted ? <ServiceInterruption /> : null
}
