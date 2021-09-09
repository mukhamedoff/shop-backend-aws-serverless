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
    error: "Sorry! This product was not created!"
  },
  null,
  2
)

module.exports = async (event) => {
  const { title, description, price, count } = JSON.parse(event.body);
  const client = new Client(dbOptions);
  let response = {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Headers" : "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,GET"
    },
    body: bodyErrorStringify,
  };
  
  await client.connect();

  try {
    const { rows: book } = await client.query(`INSERT INTO products ("title", "description", "price") VALUES ('${title}', '${description}', ${price}) RETURNING id`);
    await client.query(`INSERT INTO stocks ("product_id", "amount") VALUES ('${book[0].id}', ${count})`);
    response.body = JSON.stringify(
      {
        id: book[0].id
      },
      null,
      2
    );
  } catch(err) {
    console.error(err);
  } finally {
    client.end();
  }

  return response;
};
