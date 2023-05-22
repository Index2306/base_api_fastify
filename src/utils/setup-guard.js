const fastifyGuard = require('fastify-guard')
const _ = require('lodash')
const jwt = require('fastify-jwt')
const User = require('../models/user')
const config = require('../config')

module.exports = (fastify) => {
    fastify.register(jwt, {
        secret: config.JWT_ACCESS_SECRET,
    })
    // decorate Fastify instance with authenticate method
    fastify.decorate('authenticate', async (request, reply) => {
        try {
            const payload = await request.jwtVerify()
            if (!payload) throw new Error('invalid_token')
            const userDetail = await User.getUserDetail(payload.id)
            if (!userDetail) throw new Error('invalid_token')
            if (!_.isEmpty(userDetail?.roles) && userDetail?.roles[0]) {
                userDetail.roles = userDetail.roles.map((r) => r.title)
            } else {
                userDetail.roles = []
            }
            userDetail.partner_id = userDetail.id

            request.user = userDetail
        } catch (err) {
            console.log('err = ', err)
            reply.send({
                is_success: false,
                error_code: 'unauthorized',
                error_msg: err.message,
            })
        }
    })

    fastify.register(fastifyGuard, {
        roleProperty: 'roles',
        errorHandler: (err, req, reply) =>
            reply.code(403).send({
                is_success: false,
                error_code: 'role_denied',
                error_msg: err.message,
            }),
    })
}
