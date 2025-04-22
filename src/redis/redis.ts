import { createClient } from 'redis'

const redisClient = createClient({
    username: 'default',
    password: 'cNxxF22Hfuq7jOkUOtoepUKfekoiU7cJ',
    socket: {
        host: 'redis-17818.c325.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 17818
    }
})

redisClient.on('error', (err) => {
    console.log('Error connecting redis: ', err)
})

await redisClient.connect()


export default redisClient
