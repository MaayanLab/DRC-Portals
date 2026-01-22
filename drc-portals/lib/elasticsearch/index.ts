import singleton from '@/lib/singleton'
import { Client } from '@elastic/elasticsearch'

export default singleton('elasticsearch', () => {
  const client = new Client({
    node: process.env.ELASTICSEARCH_URL,
    auth: {
      username: 'elastic',
      password: process.env.ELASTICSEARCH_PASSWORD!,
    },
  })
  return client
})
