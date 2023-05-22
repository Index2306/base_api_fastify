const _ = require('lodash')
const { knex } = require('../connections/pg-general')

exports.insertStore = (data) => knex('store').returning('id').insert(data)
exports.insertStoreUser = (data) =>
    knex('store_user').returning('id').insert(data)

exports.getStores = async (options = {}, whereCondition) => {
    let query = knex.select().from('store')
    if (!_.isEmpty(whereCondition)) {
        const condition = {}
        query = query.where('is_deleted', false)
        if (whereCondition.keyword) {
            query = query.where((builder) => {
                builder.where('name', 'ilike', `%${whereCondition.keyword}%`)

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

exports.getStore = (id) => knex.first().from('store').where('id', id)

exports.getStoresByUser = (userId) =>
    knex
        .select()
        .from('user_store')
        .innerJoin('user', 'user.id', 'user_store.user_id')
        .where('user_store.user_id', userId)

exports.getStoreUsers = (id) =>
    knex
        .select()
        .from('user_store')
        .innerJoin('user', 'user.id', 'user_store.user_id')
        .where('user_store.store_id', id)

exports.updateStore = (id, data) => knex('store').update(data).where('id', id)

exports.deleteStore = (id) => this.updateStore(id, { is_deleted: true })
