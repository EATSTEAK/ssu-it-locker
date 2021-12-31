import AWS from 'aws-sdk';
import type { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import type { ClientApiVersions } from 'aws-sdk/clients/dynamodb';

const awsRegion = process.env.AWS_REGION ?? 'ap-southeast-2';
const TableName = process.env.TABLE_NAME ?? 'LockerTable';

const options: ServiceConfigurationOptions & ClientApiVersions = {
	apiVersion: '2012-08-10',
	region: awsRegion
};

if (process.env.AWS_SAM_LOCAL) {
	options.endpoint = new AWS.Endpoint('http://dynamodb:8000');
}

const dynamoDB = new AWS.DynamoDB(options);

export const dbTest = async function () {
	try {
		const res = await dynamoDB.describeTable({ TableName }).promise();
		console.log(JSON.stringify(res));
	} catch (e) {
		console.error(e);
	}
};
