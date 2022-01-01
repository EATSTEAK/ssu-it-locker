import AWS from 'aws-sdk';
import type { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import type { ClientApiVersions, UpdateItemInput } from 'aws-sdk/clients/dynamodb';

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

export const revokeToken = async function (
	id: string,
	token: string
): Promise<{ success: boolean; access_token: string }> {
	const req: UpdateItemInput = {
		TableName,
		Key: { id: { S: id } },
		UpdateExpression: 'REMOVE access_token',
		ConditionExpression: 'access_token = :token',
		ExpressionAttributeValues: {
			':token': { S: token }
		},
		ReturnValues: 'UPDATED_OLD'
	};
	const res = await dynamoDB.updateItem(req).promise();
	if (res.Attributes.hasOwnProperty('access_token')) {
		return { success: true, access_token: token };
	} else {
		return { success: false, access_token: token };
	}
};

export const issueToken = async function (
	id: string,
	token: string
): Promise<{ success: boolean; id: string; expires: number }> {
	const expires = Date.now() + 3600 * 1000;
	const req: UpdateItemInput = {
		TableName,
		Key: { id: { S: id } },
		UpdateExpression: 'SET access_token = :token, expires_on = :expires_on',
		ExpressionAttributeValues: {
			':token': { S: token },
			':expires_on': { N: `${expires}` }
		}
	};
	await dynamoDB.updateItem(req).promise();
	return { success: true, id, expires };
};
