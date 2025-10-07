import singleton from '@/lib/singleton'
import { Client } from 'es7'

export default singleton('elasticsearch', () => {
  const client = new Client({
    node: process.env.ELASTICSEARCH_URL,
  })
  return client
})
