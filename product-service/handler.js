'use strict';

const getProductsList = require("./handlers/getProductsList");
const getProductsById = require("./handlers/getProductsById");
const createProducts = require("./handlers/createProducts");

module.exports.getProductsList = getProductsList;
module.exports.getProductsById = getProductsById;
module.exports.createProducts = createProducts;
