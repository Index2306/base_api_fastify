const Joi = require('joi')
const _ = require('lodash')
const Product = require('../models/product')
const ProductService = require('../services/product')
const Supplier = require('../models/supplier')
const CommonUtil = require('../utils/common.util')
const { parseOption } = require('../utils/pagination')

async function createProduct(request) {
    const { user } = request
    const { has_variation, ...value } = await Joi.object()
        .keys({
            name: Joi.string().required(),
            sku: Joi.string(),
            description: Joi.string(),
            short_desc: Joi.string(),
            vendor: Joi.string().required(),
            has_variation: Joi.boolean().default(false).optional(),
            option_1: Joi.string().allow(null),
            option_2: Joi.string().allow(null),
            option_3: Joi.string().allow(null),

            origin_supplier_price: Joi.number().required(),
            supplier_warehousing_id: Joi.string().required(),

            thumb: Joi.object().allow(null),
            detail: Joi.object().allow(null),
            tags: Joi.array()
                .items(Joi.string().min(3).required())
                .allow(null)
                .default([]),
        })
        .validateAsync(request.body, { stripUnknown: true })

    if (!_.isEmpty(value.tags)) value.tags = JSON.stringify(value.tags)
    // 1 partner 1 supplier
    const supplier = await Supplier.getSupplierByPartnerId(user.partner_id)
    if (!supplier) throw new Error('invalid _supplier')
    value.partner_id = user.partner_id
    value.supplier_id = supplier.id
    const [productId] = await Product.insertProduct(value)
    const success = productId !== 0
    if (has_variation === false) {
        await Product.insertProductVariations({
            product_id: productId,
            origin_supplier_price: value.origin_supplier_price,
            is_default: true,
        })
    }

    return {
        success,
    }
}

async function supUpdateProduct(request) {
    const { id, ...body } = await Joi.object()
        .keys({
            id: Joi.string().required(),
            name: Joi.string().optional(),
            description: Joi.string().optional(),
            vendor: Joi.string().optional(),
            is_deleted: Joi.boolean().optional(),
            status: Joi.string().allow(null).default('active').optional(),
            option_1: Joi.string().allow(null).optional(),
            option_2: Joi.string().allow(null).optional(),
            option_3: Joi.string().allow(null).optional(),
            tags: Joi.array()
                .items(Joi.string().min(3).required())
                .allow(null)
                .default([]),
            thumb: Joi.object().allow(null),

            origin_supplier_price: Joi.number().optional(),
        })
        .validateAsync(
            { ...request.body, ...request.params },
            { stripUnknown: true }
        )

    const data = await Product.updateProductById(id, body)
    const is_success = data[0] !== 0

    return {
        is_success,
    }
}

async function adminUpdateProduct(request) {
    const { id, ...body } = await Joi.object()
        .keys({
            id: Joi.string().required(),
            name: Joi.string().optional(),
            description: Joi.string().optional(),
            vendor: Joi.string().optional(),
            status: Joi.string().allow(null).default('active').optional(),
            option_1: Joi.string().allow(null).optional(),
            option_2: Joi.string().allow(null).optional(),
            option_3: Joi.string().allow(null).optional(),
            tags: Joi.array()
                .items(Joi.string().min(3).required())
                .allow(null)
                .default([]),
            thumb: Joi.object().allow(null),
            is_deleted: Joi.boolean(),
            odii_price: Joi.number().optional(),
            retail_price: Joi.number().optional(),
            high_retail_price: Joi.number().optional(),
            low_retail_price: Joi.number().optional(),
        })
        .validateAsync(
            { ...request.body, ...request.params },
            { stripUnknown: true }
        )

    const data = await Product.updateProductById(id, body)
    const is_success = data[0] !== 0

    return {
        is_success,
    }
}

async function updateProductVariations(request) {
    let { variations } = await Joi.object()
        .keys({
            id: Joi.string().required(),
            variations: Joi.array().items(
                Joi.object().keys({
                    id: Joi.string().optional(),
                    product_id: Joi.string().required(),
                    sku: Joi.string().optional(),
                    barcode: Joi.string().optional(),
                    name: Joi.string().optional(),
                    position: Joi.number().allow(null).default(99).optional(),

                    origin_supplier_price: Joi.number().required(),
                    odii_price: Joi.number().required(),
                    retail_price: Joi.number().required(),
                    high_retail_price: Joi.number().required(),
                    low_retail_price: Joi.number().required(),

                    weight_grams: Joi.number().optional(),
                    option_1: Joi.string().optional(),
                    option_2: Joi.string().optional(),
                    option_3: Joi.string().optional(),
                })
            ),
        })
        .validateAsync(
            { ...request.body, ...request.params },
            { stripUnknown: true }
        )
    variations = variations.map((variation) => {
        if (variation.id && variation.barcode) {
            delete variation.barcode
        }

        if (!variation.id && !variation.barcode) {
            variation.barcode = CommonUtil.getBarcode()
        }

        return variation
    })
    const data = await Product.insertProductVariations(variations)
    const is_success = data[0] !== 0

    return {
        is_success,
    }
}

async function getProduct(request) {
    const { id } = await Joi.object()
        .keys({
            id: Joi.string().required(),
        })
        .validateAsync({ ...request.params }, { stripUnknown: true })

    const data = await Product.getProductById(id)

    return {
        is_success: true,
        data,
    }
}

async function getProductDetail(request) {
    const { id } = await Joi.object()
        .keys({
            id: Joi.string().required(),
        })
        .validateAsync({ ...request.params }, { stripUnknown: true })

    const data = await Product.getProductDetailById(id)

    return {
        is_success: true,
        ...data,
    }
}

async function getProductVariations(request) {
    const { id } = await Joi.object()
        .keys({
            id: Joi.string().required(),
        })
        .validateAsync({ ...request.params }, { stripUnknown: true })

    const data = await Product.getProductVariations(id)

    return {
        is_success: true,
        data,
    }
}

async function getProductsOfStore(request) {
    const option = parseOption(request.query)
    const data = await Product.getProductListingV2(option, request.query)

    return {
        is_success: true,
        ...data,
    }
}

async function postAddToImport(request) {
    const { user } = request
    const { product_id } = await Joi.object()
        .keys({
            product_id: Joi.string().required(),
        })
        .validateAsync(request.body, { stripUnknown: true })

    const data = await ProductService.copyProduct(product_id, user)

    return {
        is_success: true,
        ...data,
    }
}

async function getProductsSellerImport(request) {
    const { user } = request

    const option = parseOption(request.query)
    option.partner_id = user.partner_id

    const data = await Product.getProductListingV2(option, request.query)

    return {
        is_success: true,
        ...data,
    }
}
async function sellerUpdateProduct(request) {
    const { id, ...body } = await Joi.object()
        .keys({
            id: Joi.string().required(),
            name: Joi.string().optional(),
            description: Joi.string().optional(),
            vendor: Joi.string().optional(),
            status: Joi.string().allow(null).default('active').optional(),
            option_1: Joi.string().allow(null).optional(),
            option_2: Joi.string().allow(null).optional(),
            option_3: Joi.string().allow(null).optional(),
            tags: Joi.array()
                .items(Joi.string().min(3).required())
                .allow(null)
                .default([]),
            thumb: Joi.object().allow(null),
            is_deleted: Joi.boolean(),
            retail_price: Joi.number().optional(),
            high_retail_price: Joi.number().optional(),
            low_retail_price: Joi.number().optional(),
        })
        .validateAsync(
            { ...request.body, ...request.params },
            { stripUnknown: true }
        )

    const data = await Product.updateProductById(id, body)
    const is_success = data[0] !== 0

    return {
        is_success,
    }
}
async function sellerUpdateProductVariations(request) {
    let { variations } = await Joi.object()
        .keys({
            id: Joi.string().required(),
            variations: Joi.array().items(
                Joi.object().keys({
                    id: Joi.string().optional(),
                    product_id: Joi.string().required(),
                    sku: Joi.string().optional(),
                    barcode: Joi.string().optional(),
                    name: Joi.string().optional(),
                    position: Joi.number().allow(null).default(99).optional(),
                    retail_price: Joi.number().required(),
                    high_retail_price: Joi.number().required(),
                    low_retail_price: Joi.number().required(),
                    weight_grams: Joi.number().optional(),
                    option_1: Joi.string().optional(),
                    option_2: Joi.string().optional(),
                    option_3: Joi.string().optional(),
                })
            ),
        })
        .validateAsync(
            { ...request.body, ...request.params },
            { stripUnknown: true }
        )
    variations = variations.map((variation) => {
        if (!variation.barcode) {
            variation.barcode = CommonUtil.getBarcode()
        }

        return variation
    })
    const data = await Product.insertProductVariations(variations)
    const is_success = data[0] !== 0

    return {
        is_success,
    }
}

module.exports = {
    createProduct,
    getProductsOfStore,
    supUpdateProduct,
    adminUpdateProduct,
    getProduct,
    getProductDetail,
    updateProductVariations,
    getProductVariations,
    postAddToImport,
    getProductsSellerImport,
    sellerUpdateProduct,
    sellerUpdateProductVariations,
}
