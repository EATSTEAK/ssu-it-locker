import type { APIGatewayProxyHandler } from 'aws-lambda';

export const getLockerHandler: APIGatewayProxyHandler = async (event, context) => {
	return {
		statusCode: 200,
		body: JSON.stringify({
			success: true,
			result: {
				id: '2-3',
				claimed: true,
				until: 9999999999999
			}
		}),
		headers: {
			'Access-Control-Allow-Origin': '*'
		}
	};
};

export const getClaimedLockersHandler: APIGatewayProxyHandler = async (event, context) => {
	return {
		statusCode: 200,
		body: JSON.stringify({
			success: true,
			result: [
				{
					id: '2-3',
					claimed: true,
					until: 9999999999999
				}
			]
		}),
		headers: {
			'Access-Control-Allow-Origin': '*'
		}
	};
};

export const claimLockerHandler: APIGatewayProxyHandler = async (event, context) => {
	return {
		statusCode: 200,
		body: JSON.stringify({
			success: true,
			result: {
				id: '2-3',
				claimed: true,
				by: '20211561',
				until: 9999999999999
			}
		}),
		headers: {
			'Access-Control-Allow-Origin': '*'
		}
	};
};
