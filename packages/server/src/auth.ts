import https from 'https';
import { issueToken, revokeToken } from './db_client';
import type { APIGatewayProxyHandler } from 'aws-lambda';
import type { JwtPayload } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from './env';
import { createResponse } from './common';
import { ResponsibleError, UnauthorizedError } from './error';

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

export const callbackHandler: APIGatewayProxyHandler = async (event) => {
	try {
		const result = event?.queryStringParameters?.result;
		if (result) {
			console.log(result);
			const id = await obtainId(result);
			const accessToken = jwt.sign({ aud: id }, JWT_SECRET, {
				expiresIn: 3600 * 1000
			});
			const issued = await issueToken(id, accessToken);
			const left = Math.floor((issued.expires - Date.now()) / 1000);
			const res = {
				success: true,
				id,
				access_token: accessToken,
				token_type: 'Bearer',
				expires_in: left
			};
			return createResponse(200, { success: true, ...res });
		}
		return new UnauthorizedError('Unauthorized').response();
	} catch (e) {
		if (!(e instanceof ResponsibleError)) {
			console.error(e);
			const res = {
				success: false,
				error: 500,
				error_description: 'Internal error'
			};
			return createResponse(500, res);
		}
		return e.response();
	}
};

export const logoutHandler: APIGatewayProxyHandler = async (event) => {
	const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
	try {
		const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
		const res = await revokeToken(payload.aud as string, token);
		return createResponse(200, { success: true, ...res });
	} catch (err) {
		const res = {
			success: false,
			token,
			error: 401,
			error_description: 'Unauthorized'
		};
		return createResponse(401, res);
	}
};
