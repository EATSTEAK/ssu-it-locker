import type { APIGatewayProxyHandler } from 'aws-lambda';
import { createResponse, getLockerDepartment, isValidLocker } from './common';
import { claimLocker, getClaimedLockers, queryLockers, revokeLocker } from './db_client';
import type { JwtPayload } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from './env';
import { ResponsibleError } from './error';

export const getClaimedLockersHandler: APIGatewayProxyHandler = async (event) => {
	const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
	const floor = event.queryStringParameters?.floor ?? '';
	const showId = event.queryStringParameters?.show_id === 'true';
	let id: string;
	try {
		const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
		id = payload.aud as string;
	} catch {
		return createResponse(401, {
			success: false,
			error: 401,
			error_description: 'Unauthorized'
		});
	}
	if (!floor) {
		return createResponse(500, {
			success: false,
			error: 500,
			error_description: 'You should query with floor parameter'
		});
	}
	const result = await queryLockers(floor, showId, id, token);
	return createResponse(200, {
		success: true,
		floor: floor,
		result
	});
};
export const getClaimedLockerCountHandler: APIGatewayProxyHandler = async () => {
	const lockers = await getClaimedLockers();
	const result = lockers.reduce<{ E: number; A: number; C: number; S: number; G: number }>(
		(acc, cur) => {
			acc[getLockerDepartment(cur.lockerFloor, cur.lockerId)] += 1;
			return acc;
		},
		{ E: 0, A: 0, C: 0, S: 0, G: 0 }
	);
	return createResponse(200, {
		success: true,
		result
	});
};

export const claimLockerHandler: APIGatewayProxyHandler = async (event) => {
	const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
	let data: {
		locker_floor: string;
		locker_id: string;
		until?: number;
	};
	try {
		data = JSON.parse(event.body) as { locker_floor: string; locker_id: string; until?: number };
	} catch {
		return createResponse(500, {
			success: false,
			error: 500,
			error_description: 'Data body is malformed JSON'
		});
	}
	let payload: JwtPayload;
	if (!data.locker_floor && !data.locker_id) {
		try {
			payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
			const id = payload.aud as string;
			const res = await revokeLocker(id, token);
			return createResponse(200, {
				success: true,
				...res
			});
		} catch {
			return createResponse(401, {
				success: false,
				error: 401,
				error_description: 'Unauthorized'
			});
		}
	}
	if (!data.locker_floor || !data.locker_id) {
		return createResponse(500, {
			success: false,
			error: 500,
			error_description: 'Key "locker_floor" and "locker_id" are must be given'
		});
	}
	if (!isValidLocker(data.locker_floor, data.locker_id)) {
		return createResponse(500, {
			success: false,
			error: 500,
			error_description: 'Unknown locker data'
		});
	}
	if (data.until !== undefined && typeof data.until !== 'number') {
		return createResponse(500, {
			success: false,
			error: 500,
			error_description: 'Key "until" is must be number'
		});
	}
	const lockerFloor = data.locker_floor;
	const lockerId = data.locker_id;
	const until = data?.until;
	try {
		payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
	} catch {
		return createResponse(401, {
			success: false,
			error: 401,
			error_description: 'Unauthorized'
		});
	}
	try {
		const id = payload.aud as string;
		const res = until
			? await claimLocker(id, token, lockerFloor, lockerId, until)
			: await claimLocker(id, token, lockerFloor, lockerId);
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
