import * as dotenv from 'dotenv';
import https from 'https';
import { issueToken, revokeToken } from './db_client';
import type { APIGatewayProxyHandler } from 'aws-lambda';
import type { JwtPayload } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from './env';
import { createResponse } from './common';

dotenv.config();

class UnauthorizedError extends Error {}

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
	const body = await requestBody(encodeURIComponent(result));
	if (body.indexOf('pseudonym_session_unique_id') < 0) {
		throw new UnauthorizedError('Unauthorized');
	}
	return body.substring(body.indexOf('pseudonym_session_unique_id') + 36).split('"')[0];
}

export const callbackHandler: APIGatewayProxyHandler = async (event, context) => {
	try {
		const result = event?.queryStringParameters?.result;
		if (result) {
			console.log(result);
			try {
				const id = await obtainId(result);
				const accessToken = jwt.sign({ sub: id }, JWT_SECRET, {
					expiresIn: 3600 * 1000
				});
				const issued = await issueToken(id, accessToken);
				const left = Math.floor((issued.expires - Date.now()) / 1000);
				const response = {
					success: true,
					access_token: accessToken,
					token_type: 'Bearer',
					expires_in: left,
					id
				};
				return createResponse(200, response);
			} catch (e) {
				if (!(e instanceof UnauthorizedError)) {
					console.error(e);
					const response = {
						success: false,
						error: 500,
						error_description: 'Internal error'
					};
					return createResponse(500, response);
				}
			}
		}
		const response = {
			success: false,
			error: 401,
			error_description: 'Unauthorized'
		};
		return createResponse(401, response);
	} catch (err: unknown) {
		console.error('Error Thrown:', err);
		const response = {
			success: false,
			error: 500,
			error_description: 'Internal error'
		};
		return createResponse(500, response);
	}
};

export const logoutHandler: APIGatewayProxyHandler = async (event, context) => {
	const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
	try {
		const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
		const res = await revokeToken(payload.sub, token);
		return createResponse(200, res);
	} catch (err) {
		const res = {
			success: false,
			token
		};
		return createResponse(401, res);
	}
};
