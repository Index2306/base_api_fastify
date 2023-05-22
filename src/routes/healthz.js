const { healthCheck } = require('../controllers/healthz')

async function routes(fastify) {
    fastify.get('/healthz', healthCheck)
    // eslint-disable-next-line arrow-body-style
    fastify.get('/', () => {
        return { message: 'hello world' }
    })
}

module.exports = routes
