const Product = require('../models/product')
const CommonUtil = require('../utils/common.util')

exports.copyProduct = async (parentProductId, user) => {
    const product = await Product.getProductDetailById(parentProductId)

    if (!product) {
        throw new Error('ID_NOT_FOUND')
    }
    const initProduct = {
        name: product.name,
        sku: product.sku,
        status: product.status,
        description: product.description,
        vendor: product.vendor,
        option_1: product.option_1,
        option_2: product.option_2,
        option_3: product.option_3,
        currency_code: product.currency_code,
        origin_supplier_price: product.origin_supplier_price,
        high_retail_price: product.high_retail_price,
        low_retail_price: product.low_retail_price,
        retail_price: product.retail_price,
        odii_price: product.odii_price,
        supplier_warehousing_id: product.supplier_warehousing_id,
        parent_product_id: product.id,
        detail: product.detail,
        total_quantity: product.total_quantity,
        supplier_id: product.supplier_id,
        partner_id: user.partner_id,
        tags: JSON.stringify(product.tags.map((tag) => tag)),
    }
    const [productId] = await Product.insertProduct(initProduct)

    await Product.insertProductVariations(
        product.product_variations.map((productVariation) => ({
            ...productVariation,
            ...{
                id: undefined,
                product_id: productId,
                barcode: CommonUtil.getBarcode(),
                created_at: undefined,
            },
        }))
    )

    await Product.insertProductImages(
        product.product_image.map((productImage) => ({
            ...productImage,
            ...{
                id: undefined,
                product_id: productId,
                created_at: undefined,
            },
        }))
    )

    return {
        product_id: productId,
    }
}
