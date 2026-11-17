import singleton from '@/lib/singleton'
import { Client } from '@elastic/elasticsearch'

export default singleton('elasticsearch', () => {
  const client = new Client({
    node: process.env.ELASTICSEARCH_URL,
    // Bound waits at the transport so safeAsync can handle service outages.
    // Let a later user request retry instead of delaying this one with retries.
    requestTimeout: 10_000,
    maxRetries: 0,
    auth: {
      username: 'elastic',
      password: process.env.ELASTICSEARCH_PASSWORD!,
    },
  })
  return client
})
