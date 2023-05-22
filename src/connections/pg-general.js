const { attachPaginate } = require('knex-paginate')
const config = require('../config')

attachPaginate()

// eslint-disable-next-line import/order
const knex = require('knex')({
    client: 'pg',
    connection: config.postgresqlUrl,
})

const doPagination = async (query, options) => {
    const result = await query
        .orderBy(options.order_by || 'id', options.reverse ? 'desc' : 'asc')
        .paginate({
            perPage: options.limit || 15,
            currentPage: options.page || 1,
            isLengthAware: true,
        })
        .catch((e) => {
            throw new Error(e.message)
        })

    return {
        pagination: {
            total: result.pagination.total,
            last_page: result.pagination.lastPage,
        },
        data: result.data,
    }
}

module.exports = {
    knex,
    doPagination,
}
