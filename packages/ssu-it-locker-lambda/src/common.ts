import type { APIGatewayProxyResult } from 'aws-lambda';

export function createResponse(statusCode: number, body: string | object): APIGatewayProxyResult {
	const stringifyBody = typeof body === 'string' ? body : JSON.stringify(body);
	const res: APIGatewayProxyResult = {
		statusCode,
		body: stringifyBody,
		headers: {
			'Content-Type': 'application/json'
		}
	};
	if (process.env.AWS_SAM_LOCAL) {
		res.headers['Access-Control-Allow-Origin'] = '*';
	}
	return res;
}
