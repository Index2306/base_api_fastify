const _ = require('lodash')
const { knex } = require('../connections/pg-general')

exports.insertProduct = (data) => knex('product').returning('id').insert(data)

exports.insertProdcutVariation = (data) =>
    knex('product_variation').returning('id').insert(data)

exports.insertProductImage = (data) =>
    knex('product_image').returning('id').insert(data)

exports.updateProduct = (condition, data) =>
    knex('product').where(condition).update(data)

exports.updateProductById = (id, data) => this.updateProduct({ id }, data)

exports.getProducts = (condition) =>
    knex.select().from('product').where(condition)

exports.getProduct = (condition) =>
    knex.first().from('product').where(condition)
exports.getProductById = (id) => this.getProduct({ id })

exports.getProductListingV2 = async (options = {}, whereCondition) => {
    let query = knex
        .select([
            'p.id',
            'p.partner_id',
            'p.name',
            'p.vendor',
            'p.thumb',
            'p.tags',
            'p.odii_price',
            'p.total_quantity',
            'p.short_desc',
            'p.currency_code',
            'p.high_retail_price',
            'p.low_retail_price',
            's.id as supplier_id',
            's.name as supplier_name',
            knex.raw('row_to_json("from".*) as from_location'),
            // knex.raw('json_build_object("id", s.id) as supplier'),
        ])
        .from('product as p')
        .innerJoin('supplier as s', 'p.supplier_id', 's.id')
        .innerJoin(
            'supplier_warehousing as sw',
            'p.supplier_warehousing_id',
            'sw.id'
        )
        .innerJoin('location as from', 'sw.location_id', 'from.id')
        .leftJoin(
            'product_category_vs_product as pcp',
            'p.id',
            'pcp.product_id'
        )
        .leftJoin('product_category as pc', 'pcp.product_category_id', 'pc.id')
        .where({ 'p.is_deleted': false, 's.is_deleted': false })

    if (options.partner_id) {
        query = query.andWhere('p.partner_id', options.partner_id)
    }

    if (!_.isEmpty(whereCondition)) {
        if (whereCondition.keyword) {
            query = query.andWhere((builder) => {
                builder.where('p.name', 'ilike', `%${whereCondition.keyword}%`)

                if (parseInt(whereCondition.keyword, 10))
                    builder.orWhere(
                        'p.id',
                        parseInt(whereCondition.keyword, 10)
                    )

                return builder
            })
        }
        if (whereCondition.from_province_code) {
            query = query.andWhere(
                'from.province_code',
                whereCondition.from_province_code
            )
        }

        // TODO: chú ý check quyền admin product
        if (whereCondition.partner_id) {
            query = query.andWhere('p.partner_id', whereCondition.partner_id)
        }

        if (!_.isEmpty(whereCondition.tag)) {
            if (_.isArray(whereCondition.tag))
                query = query.whereRaw(
                    `p.tags \\?| array[${whereCondition.tag
                        .map((item) => `'${item}'`)
                        .join(', ')}]`
                )
            else
                query = query.whereRaw(
                    `p.tags \\?| array['${whereCondition.tag}']`
                )
        }

        if (!_.isEmpty(whereCondition.child_category_id)) {
            if (_.isArray(whereCondition.child_category_id))
                query = query.whereIn('pc.id', whereCondition.child_category_id)
            else
                query = query.andWhere(
                    'pc.id',
                    whereCondition.child_category_id
                )
        }
    }
    query = query.groupBy('p.id', 's.id', 's.name', 'from.id')
    console.log('query = ', query.toString())

    const result = await query
        .orderBy(options.order_by || 'p.id', options.order_direction)
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

exports.getProductVariations = async (product_id) => {
    const product = await knex
        .select([
            'product_variation.*',
            knex.raw(`row_to_json("from".*) as thumb`),
        ])
        .from('product_variation')
        .leftJoin(
            'product_image',
            'product_variation.product_image_id',
            'product_image.id'
        )
        .where({ is_deleted: false })
        .andWhere('product_variation.product_id', product_id)
        .groupBy('product_variation.id')

    return product
}

/**
 * desc: product info + variant + inventory
 */

exports.getProductDetail = async (id) => {
    const product = await knex
        .select([
            'product.*',
            knex.raw(`json_agg(product_image.*) as product_images`),
        ])
        .first()
        .from('product')
        .leftJoin('product_image', 'product.id', 'product_image.product_id')
        .where('product.is_deleted', false)
        .andWhere('product.id', id)
        .groupBy('product.id')

    const variations = await this.getProductVariations(id)

    return { ...product, variations }
}

exports.getProductVariationsByProductId = async (product_id) => {
    const product = await knex
        .select(['product_variation.*'])
        .from('product_variation')
        .where({ is_deleted: false })
        .andWhere('product_variation.product_id', product_id)
        .groupBy('id')

    return product
}

exports.getProductDetailById = async (id) => {
    const product = await knex
        .select([
            'product.*',
            knex.raw(`json_agg(product_image.*) as product_image`),
        ])
        .from('product')
        .leftJoin('product_image', 'product_image.product_id', 'product.id')
        .first()
        .where('product.is_deleted', false)
        .andWhere('product.id', id)
        .groupBy('product.id')

    const product_variations = await this.getProductVariationsByProductId(id)

    return { ...product, product_variations }
}
exports.insertProductVariations = (data) =>
    knex('product_variation')
        .returning('id')
        .insert(data)
        .onConflict('id')
        .ignore()

exports.insertProductImages = (data) =>
    // eslint-disable-next-line newline-per-chained-call
    knex('product_image').returning('id').insert(data).onConflict('id').ignore()
