import singleton from '@/lib/singleton'
import { makeWorkerUtils } from 'graphile-worker'

export default singleton('graphile-worker-utils', async () => {
  const workerUtils = await makeWorkerUtils({
    connectionString: process.env.DATABASE_URL,
  })
  await workerUtils.migrate()
  process.on('exit', () => {
    workerUtils.release()
  })
  return workerUtils
})
