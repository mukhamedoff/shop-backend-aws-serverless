'use strict';

const bodyErrorStringify = JSON.stringify(
  {
    error: "Sorry! This book does not exist!"
  },
  null,
  2
)
const ProductsList = require("../ProductsList.json");
const findBookById = (id, books) => {
  return books.filter(book => {
    return id === book.id;
  })[0] || null;
}

module.exports = async (event, context) => {
  const id = event.pathParameters?.productId;
  let bookFound = null;
  let response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers" : "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,GET"
    },
    body: bodyErrorStringify,
  };
  if (id && (bookFound = findBookById(id, ProductsList.books))) {
    response.body = JSON.stringify(
      bookFound,
      null,
      2
    );
  }
  return response;
};
