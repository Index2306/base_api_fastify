const _ = require('lodash')
const { knex } = require('../connections/pg-general')

exports.getSuppliers = async (options = {}, whereCondition) => {
    let query = knex.select().from('supplier')
    if (!_.isEmpty(whereCondition)) {
        const condition = {}
        query = query.where('is_deleted', false)
        if (whereCondition.keyword) {
            query = query.where((builder) => {
                builder
                    .where('name', 'ilike', `%${whereCondition.keyword}%`)
                    .orWhere(
                        'description',
                        'ilike',
                        `%${whereCondition.keyword}%`
                    )
                    .orWhere('status', 'ilike', `%${whereCondition.keyword}%`)
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

exports.insertSupplier = (data) => knex('supplier').returning('id').insert(data)

exports.updateSupplier = (condition, data) =>
    knex('supplier').update(data).where(condition)

exports.updateSupplierById = (id, data) => this.updateSupplier({ id }, data)

exports.getSupplier = (condition) =>
    knex.first().from('supplier').where(condition)

exports.getSupplierById = (id) => this.getSupplier({ id })
exports.getSupplierByPartnerId = (partner_id) =>
    this.getSupplier({ partner_id })

exports.deleteSupplier = (condition) => knex('supplier').where(condition).del()

exports.deleteSupplierById = (id) => this.deleteSupplier({ id })
