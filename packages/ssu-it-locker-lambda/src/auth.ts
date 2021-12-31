import https from 'https';
import * as dbClient from './db_client';
import type { APIGatewayProxyHandler } from 'aws-lambda';

function requestBody(result: string): Promise<string> {
	return new Promise((resolve, reject) => {
		https
			.get(`https://canvas.ssu.ac.kr/learningx/login/from_cc?result=${result}`, (res) => {
				let body = '';
				res.on('data', function (chunk) {
					body += chunk;
				});
				res.on('end', function () {
					resolve(body);
				});
			})
			.on('error', (res) => {
				console.log('Error thrown..');
				reject(res);
			});
	});
}

async function obtainId(result: string) {
	try {
		const body = await requestBody(encodeURIComponent(result));
		if (body.indexOf('pseudonym_session_unique_id') < 0) {
			return { success: false, code: 401, reason: 'Unauthorized' };
		}
		const id = body.substring(body.indexOf('pseudonym_session_unique_id') + 36).split('"')[0];
		return { success: true, code: 200, id };
	} catch (err) {
		return { success: false, code: 500, reason: 'Internal Error' };
	}
}

let response;

export const callbackHandler: APIGatewayProxyHandler = async (event, context) => {
	try {
		const result = event?.queryStringParameters?.result;
		if (result) {
			console.log(result);
			const id = await obtainId(result);
			return {
				statusCode: id.code,
				body: JSON.stringify(id),
				headers: {
					'Access-Control-Allow-Origin': '*'
				}
			};
		}
		return {
			statusCode: 401,
			body: JSON.stringify({
				success: false,
				reason: 'Unauthorized'
			}),
			headers: {
				'Access-Control-Allow-Origin': '*'
			}
		};
	} catch (err: unknown) {
		console.error('Error Thrown:', err);
		return {
			statusCode: 500,
			body: JSON.stringify({
				success: false,
				reason: 'Internal Error'
			}),
			headers: {
				'Access-Control-Allow-Origin': '*'
			}
		};
	}
};

export const logoutHandler: APIGatewayProxyHandler = async (event, context) => {
	await dbClient.dbTest();
	return {
		statusCode: 200,
		body: JSON.stringify({
			success: true
		}),
		headers: {
			'Access-Control-Allow-Origin': '*'
		}
	};
};
