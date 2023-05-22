const {
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
} = require('../../controllers/product')

async function routes(fastify) {
    fastify.addHook('preValidation', fastify.authenticate)

    // SUP
    fastify.post(
        '/supplier/product',
        { preHandler: [fastify.guard.role('owner')] },
        createProduct
    )
    fastify.put(
        '/supplier/product/:id',
        { preHandler: [fastify.guard.role('owner')] },
        supUpdateProduct
    )

    fastify.put(
        '/admin/product/:id',
        { preHandler: [fastify.guard.role('owner', 'admin_product')] },
        adminUpdateProduct
    )

    fastify.get('/products', getProductsOfStore)
    fastify.get('/product/:id', getProduct)
    fastify.get('/product/:id/detail', getProductDetail)
    fastify.get('/product/:id/variations', getProductVariations)
    fastify.put(
        '/product/:id/variations',
        { preHandler: [fastify.guard.role('owner', 'partner_product')] },
        updateProductVariations
    )
    fastify.post(
        '/seller/add-to-import-product-list',
        { preHandler: [fastify.guard.role('owner', 'partner_product')] },
        postAddToImport
    )
    fastify.get('/seller/list-import-product', getProductsSellerImport)
    fastify.put(
        '/seller/product/:id',
        { preHandler: [fastify.guard.role('owner', 'admin_oder')] },
        sellerUpdateProduct
    )
    fastify.put(
        '/seller/product/:id/variation',
        { preHandler: [fastify.guard.role('owner', 'admin_oder')] },
        sellerUpdateProductVariations
    )
}

module.exports = routes
