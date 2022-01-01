import type { APIGatewayProxyHandler } from 'aws-lambda';
import { createResponse } from './common';

export const getLockerHandler: APIGatewayProxyHandler = async (event, context) => {
	return createResponse(200, {
		success: true,
		result: {
			id: '2-3',
			claimed: true,
			until: 9999999999999
		}
	});
};

export const getClaimedLockersHandler: APIGatewayProxyHandler = async (event, context) => {
	return createResponse(200, {
		success: true,
		result: [
			{
				id: '2-3',
				claimed: true,
				until: 9999999999999
			}
		]
	});
};

export const claimLockerHandler: APIGatewayProxyHandler = async (event, context) => {
	return createResponse(200, {
		success: true,
		result: {
			id: '2-3',
			claimed: true,
			by: '20211561',
			until: 9999999999999
		}
	});
};
