const AWS = require("aws-sdk");
const csv = require("fast-csv");
const BUCKET = "aws-nodejs-import-service";
const REGION = "eu-west-1";
const PREFIX = "uploaded/";

const createProducts = require("./handlers/createProducts");

const getNameOfFirstFile = (files) => {
  return files.filter(file => file.Size)[0].Key;
};
AWS.config.update({region: REGION});

module.exports = {
  importProductsFile: async function (event) {
    const { name } = event.queryStringParameters;
    console.log("name", name);
    const s3 = new AWS.S3({region: REGION});
    const params = {
      Bucket: BUCKET,
      Prefix: PREFIX
    };
    let status = 200;
    let files = [];

    try {
      const s3Response = await s3.listObjectsV2(params).promise();
      files = s3Response.Contents;
    } catch (error) {
      console.log("Error importProductsFile")
    }

    const signedUrl = `https://${BUCKET}.s3.amazonaws.com/${getNameOfFirstFile(files)}`;
    const response = {
      statusCode: status,
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
      },
      body: JSON.stringify({signedUrl})
    };
    return response;
  },
  importFileParser: async function (event, context, callback) {
    const { Records } = event;
    const s3 = new AWS.S3({region: REGION});
    const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
    const { object } = Records[0].s3;
    const params = {
      Bucket: BUCKET,
      Key: object.key
    };

    const s3Object = await s3.getObject(params).promise();
    const data = s3Object.Body.toString('utf-8');
    const rows = data.split('\n');
    const titles = rows.shift().trim().replace("\r", "").replace(/^"/, "").replace(/"$/, "").split('","');
    const titlesLength = titles.length;
    const products = rows.map(row => {
      const data = row.trim().replace("\r", "").replace(/^"/, "").replace(/"$/, "").split('","');
      let product = {};
      let dataLength = data.length;
      if(titlesLength !== dataLength) return;
      for (let i = 0; i < dataLength; i++) {
        product[titles[i]] = titles[i] === "price" || titles[i] === "count" ? parseInt(data[i]) : data[i];
      }
      return product;
    }).filter(product => product);

    for (let i = 0; i < products.length; i++) {
      const message = {
        QueueUrl: process.env.SQS_URL,
        MessageBody: JSON.stringify(products[i])
      };
      const response = await sqs.sendMessage(message).promise();
      console.log(`Message put on queue`, response);
    }

    let status = 200;

    const response = {
      statusCode: status,
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
      },
      body: JSON.stringify({
        message: `Parsed ${products.length} item(s)`
      })
    };
    return response;
  },
  catalogBatchProcess: async function (event) {
    const records = event.Records;
    console.log("catalogBatchProcess records", records);

    for (let i = 0; i < records.length; i++) {
      const { body } = records[i];
      await createProducts({ body });
    }

    const sns = new AWS.SNS({region: REGION});
    sns.publish({
      Subject: "You are parsed products",
      Message: "Products was parsed",
      TopicArn: process.env.SNS_ARN
    }, () => {
      console.log("Send email with products");
    });
  }
}