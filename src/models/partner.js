const { knex } = require('../connections/pg-general')

exports.insertPartner = (data) => knex('partner').returning('id').insert(data)

exports.getPartners = () => knex.select().from('partner')

exports.getPartnerById = (partnerId) =>
    knex.first().from('partner').where('id', partnerId)
