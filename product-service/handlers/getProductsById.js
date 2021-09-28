'use strict';

const { Client } = require("pg");
const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;
const dbOptions = {
  host: PG_HOST,
  port: PG_PORT,
  database: PG_DATABASE,
  user: PG_USERNAME,
  password: PG_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMilles: 5000
}

const bodyErrorStringify = JSON.stringify(
  {
    error: "Sorry! This book does not exist!"
  },
  null,
  2
)
const findBookById = (id, books) => {
  return books.filter(book => {
    return id === book.id;
  })[0] || null;
}

module.exports = async (event) => {
  const id = event.pathParameters?.productId;
  const client = new Client(dbOptions);
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

  await client.connect();

  try {
    const { rows: books } = await client.query(`SELECT p.*, s.amount as count FROM products p LEFT JOIN stocks s ON p.id = s.product_id WHERE p.id = '${id}'`);
    if (id && (bookFound = findBookById(id, books))) {
      response.body = JSON.stringify(
        bookFound,
        null,
        2
      );
    }
    return response;
  } catch(err) {
    console.error(err);
  } finally {
    client.end();
  }
};
