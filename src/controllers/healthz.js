const debug = require('debug')('odii-api:controller:healthz')
const { knex } = require('../connections/pg-general')

const state = { isShutdown: false }

process.on('SIGTERM', () => {
    state.isShutdown = true
})

function initiateGracefulShutdown() {
    debug('initiateGracefulShutdown')
    knex.destroy((err) => {
        process.exit(err ? 1 : 0)
    })
}

async function healthCheck(request, reply) {
    debug('GET /healthz')

    if (state.isShutdown) {
        debug('GET /healthz NOT OK')
        setTimeout(initiateGracefulShutdown, 2000)
        reply.code(500).send('not ok')
    }

    // return 'ok' // this.redis.ping(),
    try {
        const status = await Promise.all([knex.select(1), this.redis.ping()])
        debug('status', status)

        return 'ok'
    } catch (error) {
        return 'not ok'
    }
}

module.exports = {
    healthCheck,
}
