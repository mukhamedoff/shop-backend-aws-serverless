'use strict';

const ProductsList = require("../ProductsList.json");

module.exports = async (event) => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers" : "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,GET"
    },
    body: JSON.stringify(
      ProductsList?.books || [],
      null,
      2
    ),
  };
};
