import IORedis from 'ioredis'

export function createRedisConnection(): unknown {
  const connection = new IORedis(process.env.UPSTASH_REDIS_URL!, { maxRetriesPerRequest: null })
  connection.on('error', (err) => console.error('[Redis] Connection error:', err.message))
  return connection
}
