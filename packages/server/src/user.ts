import type { APIGatewayProxyHandler } from 'aws-lambda';
import type { JwtPayload } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from './env';
import { getUserInfo, updateUserInfo } from './db_client';
import { createResponse } from './common';
import { ResponsibleError } from './error';

export const getUserInfoHandler: APIGatewayProxyHandler = async (event) => {
	const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
	const id = (jwt.verify(token, JWT_SECRET) as JwtPayload).aud as string;
	const res = await getUserInfo(id);
	if (res.lockerId) {
		return createResponse(200, {
			success: true,
			result: { ...res, claimed: true }
		});
	}
	return createResponse(200, {
		success: true,
		result: {
			...res,
			claimed: false
		}
	});
};

export const updateUserInfoHandler: APIGatewayProxyHandler = async (event) => {
	const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
	let data: {
		id: string;
		is_admin?: boolean;
		department?: string;
	};

	try {
		data = JSON.parse(event.body) as {
			id: string;
			is_admin?: boolean;
			department?: string;
		};
	} catch {
		return createResponse(500, {
			success: false,
			error: 500,
			error_description: 'Data body is malformed JSON'
		});
	}
	if (!data.id) {
		return createResponse(500, {
			success: false,
			error: 500,
			error_description: 'Internal error'
		});
	}
	let payload: JwtPayload;
	try {
		payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
	} catch {
		console.debug('malformed token');
		return createResponse(401, {
			success: false,
			error: 401,
			error_description: 'Unauthorized'
		});
	}
	try {
		const id = payload.aud as string;
		const res = await updateUserInfo(id, token, {
			id: data.id,
			isAdmin: data.is_admin,
			department: data.department
		});
		return createResponse(200, { success: true, ...res });
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
