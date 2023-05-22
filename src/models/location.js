const _ = require('lodash')
const { knex } = require('../connections/pg-general')

exports.getLocations = async (options = {}, whereCondition) => {
    let query = knex.select().from('location')
    if (!_.isEmpty(whereCondition)) {
        const condition = {}
        if (whereCondition.keyword) {
            query = query.where((builder) => {
                builder
                    .where('province', 'ilike', `%${whereCondition.keyword}%`)
                    .orWhere(
                        'province_code',
                        'ilike',
                        `%${whereCondition.keyword}%`
                    )
                    .orWhere('country', 'ilike', `%${whereCondition.keyword}%`)
                    .orWhere('address1', 'ilike', `%${whereCondition.keyword}%`)
                    .orWhere('address2', 'ilike', `%${whereCondition.keyword}%`)
                if (parseInt(whereCondition.keyword, 10))
                    builder.orWhere('id', parseInt(whereCondition.keyword, 10))

                return builder
            })
        }
        query = query.andWhere(condition)
    }
    const result = await query
        .orderBy(options.order_by || 'id', options.order_direction)
        .paginate(options.paginate)

    return {
        pagination: {
            total: result.pagination.total,
            last_page: result.pagination.lastPage,
            page: options.page,
            page_size: options.page_size,
        },
        data: result.data,
    }
}

exports.insertLocation = (data) => knex('location').returning('id').insert(data)

exports.updateLocation = (condition, data) =>
    knex('location').update(data).where(condition)

exports.updateLocationById = (id, data) => this.updateLocation({ id }, data)

exports.getLocation = (condition) =>
    knex.first().from('location').where(condition)

exports.getLocationById = (id) => this.getLocation({ id })

exports.deleteLocation = (condition) => knex('location').where(condition).del()

exports.deleteLocationById = (id) => this.deleteLocation({ id })
