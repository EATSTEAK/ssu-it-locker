const AWS = require("aws-sdk");
const awsRegion = process.env.AWS_REGION ?? "ap-southeast-2";
const tableName = process.env.TABLE_NAME ?? "LockerTable";

let options = {
  apiVersion: "2012-08-10",
  region: awsRegion,
};

if (process.env.AWS_SAM_LOCAL) {
  options.endpoint = new AWS.Endpoint("http://dynamodb:8000");
}

const dynamoDB = new AWS.DynamoDB(options);

exports.dbTest = async function () {
  try {
    const res = await dynamoDB.listTables().promise();
    console.log(JSON.stringify(res));
  } catch (e) {
    console.error(e);
  }
};
