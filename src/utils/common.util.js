// eslint-disable-next-line import/no-unresolved
const { customAlphabet } = require('nanoid')

const nanoidBarcode = customAlphabet('0123456789', 13)

exports.getBarcode = () => nanoidBarcode()
