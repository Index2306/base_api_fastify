const _ = require('lodash')
const { knex } = require('../connections/pg-general')

exports.insertUser = (data) => knex('user').returning('id').insert(data)

exports.getUsers = () => knex.select().from('user')

exports.getUser = (condition) => knex.first().from('user').where(condition)

exports.getUserById = (id) => this.getUser({ id })

exports.getUserByEmail = (email) =>
    knex.first().from('user').where('email', email)

exports.getUserWithAuthByEmail = (email) =>
    knex
        .select()
        .from('user')
        .innerJoin('user_auth', 'user_auth.user_id', 'user.id')
        .where('user.email', email)

exports.getUserPartnerRoles = (userId) =>
    knex
        .select([
            'partner.*',
            knex.raw(`json_agg(role.*) as roles`),
            knex.raw('partner_user.id as partner_user_id'),
        ])
        .first()
        .from('partner')
        .innerJoin('partner_user', 'partner_user.partner_id', 'partner.id')
        .leftJoin(
            'partner_user_role',
            'partner_user_role.partner_user_id',
            'partner_user.id'
        )
        .leftJoin('role', 'role.id', 'partner_user_role.role_id')
        .where('partner_user.user_id', userId)
        .andWhere('partner_user.is_active', true)
        .groupBy('partner.id', 'partner_user.id')

exports.getUserDetail = (userId) =>
    knex
        .select([
            'user.*',
            knex.raw(`json_agg(role.*) as roles`),
            knex.raw('partner_user.id as partner_user_id'),
            knex.raw('partner.id as partner_id'),
        ])
        .first()
        .from('user')
        .innerJoin('partner', 'partner.user_id', 'user.id')
        .innerJoin('partner_user', 'partner_user.partner_id', 'partner.id')
        .leftJoin(
            'partner_user_role',
            'partner_user_role.partner_user_id',
            'partner_user.id'
        )
        .leftJoin('role', 'role.id', 'partner_user_role.role_id')
        .where('user.id', userId)
        .andWhere('user.status', 'active')
        .andWhere('user.is_deleted', false)
        .groupBy('user.id', 'partner.id', 'partner_user.id')

exports.insertUserAuth = (data) => knex('user_auth').insert(data)

exports.getUserAuth = (userId) =>
    knex.first().from('user_auth').where('user_id', userId)

exports.updateUser = (condition, data) =>
    knex('user').update(data).where(condition)

exports.updateUserById = (id, data) => this.updateUser({ id }, data)

exports.updateUserAuth = (user_id, data) =>
    knex('user_auth').update(data).where('user_id', user_id)

exports.getUserListing = async (options = {}, whereCondition) => {
    let query = knex.select().from('user')
    if (!_.isEmpty(whereCondition)) {
        query = query.where('is_deleted', false)
        if (whereCondition.keyword) {
            query = query.where((builder) => {
                builder
                    .where('email', 'ilike', `%${whereCondition.keyword}%`)
                    .orWhere(
                        'full_name',
                        'ilike',
                        `%${whereCondition.keyword}%`
                    )
                    .orWhere(
                        'first_name',
                        'ilike',
                        `%${whereCondition.keyword}%`
                    )
                    .orWhere(
                        'last_name',
                        'ilike',
                        `%${whereCondition.keyword}%`
                    )
                    .orWhere('phone', 'ilike', `%${whereCondition.keyword}%`)
                if (parseInt(whereCondition.keyword, 10))
                    builder.orWhere('id', parseInt(whereCondition.keyword, 10))

                return builder
            })
        }
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

exports.insertPartnerUser = (data) =>
    knex('partner_user').returning('id').insert(data)
exports.updatePartnerUser = (condition, data) =>
    knex('partner_user').update(data).where(condition)

exports.getPartnerUser = (condition) =>
    knex.first().from('partner_user').where(condition)

exports.updatePartnerUserActiveByUserIdPartnerId = (
    partner_id,
    user_id,
    is_active
) => this.updatePartnerUser({ partner_id, user_id }, { is_active })

exports.upsertPartnerUserRole = (data) => knex('partner_user_role').insert(data)

exports.deletePartnerUserRole = (id) =>
    knex('partner_user_role').where('partner_user_id', id).del()

exports.getUserPartner = async (userId) =>
    knex
        .select([
            'user.*',
            knex.raw(`json_agg(role.*) as roles`),
            knex.raw('json_agg(partner.*) as partner_user'),
            knex.raw('partner.id as partner_id'),
        ])
        .first()
        .from('user')
        .innerJoin('partner', 'partner.user_id', 'user.id')
        .innerJoin('partner_user', 'partner_user.partner_id', 'partner.id')
        .leftJoin(
            'partner_user_role',
            'partner_user_role.partner_user_id',
            'partner_user.id'
        )
        .leftJoin('role', 'role.id', 'partner_user_role.role_id')
        .where('user.id', userId)
        .andWhere('user.status', 'active')
        .andWhere('user.is_deleted', false)
        .groupBy('user.id', 'partner.id', 'partner_user.id')
