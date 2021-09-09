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

module.exports = async (event) => {
  const client = new Client(dbOptions);
  await client.connect();

  try {
    const { rows: books } = await client.query("SELECT p.*, s.amount as count FROM products p LEFT JOIN stocks s ON p.id = s.product_id");
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
      },
      body: JSON.stringify(
        books || [],
        null,
        2
      ),
    };
  } catch(err) {
    console.error(err);
  } finally {
    client.end();
  }
};
