const roles = {
    SUPER_ADMIN: 'super_admin',
    ADMIN_PRODUCT: 'admin_product',
    ADMIN_ORDER: 'admin_order',
    ADMIN_USER: 'admin_user',
    ADMIN_BALANCE: 'admin_balance',
    OWNER: 'owner',
    PARTNER_PRODUCT: 'partner_product',
    PARTNER_ORDER: 'partner_order',
    PARTNER_BALANCE: 'partner_balance',
}

exports.ACC_TYPE = {
    SUP: 'supplier',
    ADMIN: 'admin',
    SELLER: 'seller',
}

exports.ACC_TYPE_ARR = Object.values(this.ACC_TYPE)

exports.Roles = roles

exports.STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
}

exports.STATUS_ARR = Object.values(this.STATUS)

exports.COLLECTION_TYPE = {
    MANUAL: 'manual',
    AUTO: 'auto',
}

exports.COLLECTION_DISJUNCTIVE = {
    AND: 'and',
    OR: 'or',
}

exports.COLLECTION_DISJUNCTIVE_ARR = Object.values(this.COLLECTION_DISJUNCTIVE)
