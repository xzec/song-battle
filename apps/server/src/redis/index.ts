import { createClient } from 'redis'

const REDIS_URL = 'redis://localhost:6379'

async function createRedis() {
  const client = createClient({
    url: REDIS_URL,
  })

  client.on('error', (err) => console.log('Redis Client Error', err))

  await client.connect()

  return client
}

export default createRedis

// await client.hSet('user-session:123', {
//   name: 'John',
//   surname: 'Smith',
//   company: 'Redis',
//   age: 29,
// })
//
// let userSession = await client.hGetAll('user-session:123')
// console.log(JSON.stringify(userSession, null, 2))
/* >>>
{
  "surname": "Smith",
  "name": "John",
  "company": "Redis",
  "age": "29"
}
 */
