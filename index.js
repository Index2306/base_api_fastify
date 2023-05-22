const fs = require('fs')

if (fs.existsSync('.env.local')) {
    // eslint-disable-next-line global-require
    require('dotenv-safe').config({ path: '.env.local' })
} else if (fs.existsSync('.env')) {
    // eslint-disable-next-line global-require
    require('dotenv-safe').config({ path: '.env' })
}
if (!process.env.POSTGRESQL_URL) throw new Error('Config Not Found')
const fastify = require('fastify')({
    disableRequestLogging: true,
    logger: { prettyPrint: true },
})
const autoload = require('fastify-autoload')

const cors = require('fastify-cors')
const multipart = require('fastify-multipart')
const path = require('path')
const config = require('./src/config')
const errorMessages = require('./src/utils/error-message')

/**
 * To guarantee a consistent and predictable behaviour of your application, we highly recommend to always load your code as shown below:
 * └── plugins (from the Fastify ecosystem)
 * └── your plugins (your custom plugins)
 * └── decorators
 * └── hooks
 * └── your services
 */

require('./src/utils/setup-guard')(fastify)

fastify.register(multipart, {
    limits: {
        fieldNameSize: 2000, // Max field name size in bytes
        // fieldSize: 100, // Max field value size in bytes
        fields: 10, // Max number of non-file fields
        fileSize: 1000000, // For multipart forms, the max file size in bytes
        files: 1, // Max number of file fields
        headerPairs: 2000, // Max number of header key=>value pairs
    },
})

fastify.register(autoload, {
    dir: path.join(__dirname, 'src/routes'),
})

fastify.register(cors, {
    origin: '*',
})
fastify.register(require('fastify-redis'), config.redis)

fastify.setErrorHandler((error, request, reply) => {
    console.log('error handler: ', error)
    reply.code(400).send({
        error_code: error.message,
        error_message: errorMessages[error.message],
    })
})

const startServer = async () => {
    try {
        await fastify.listen(config.port, '0.0.0.0')
    } catch (error) {
        fastify.log.error(error)
        process.exit(1)
    }
}

startServer()
