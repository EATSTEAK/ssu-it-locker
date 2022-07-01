import AWS from 'aws-sdk';
import type { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import type {
	BatchWriteItemInput,
	ClientApiVersions,
	ExpressionAttributeValueMap,
	GetItemInput,
	QueryInput,
	ScanInput,
	UpdateItemInput,
	WriteRequest
} from 'aws-sdk/clients/dynamodb';
import { CantClaimError, ResponsibleError, UnauthorizedError } from './error';

type UserInfo = {
	id: string;
	isAdmin: boolean;
	department: 'E' | 'A' | 'C' | 'S' | 'G';
	lockerId?: string;
	claimedUntil?: number;
};

const awsRegion = process.env.AWS_REGION ?? 'ap-southeast-2';
const TableName = process.env.TABLE_NAME ?? 'LockerTable';
const adminId = process.env.ADMIN_ID ?? '20211561';

const options: ServiceConfigurationOptions & ClientApiVersions = {
	apiVersion: '2012-08-10',
	region: awsRegion
};

if (process.env.AWS_SAM_LOCAL) {
	options.endpoint = new AWS.Endpoint('http://dynamodb:8000');
}

const dynamoDB = new AWS.DynamoDB(options);

export const revokeToken = async function(
	id: string,
	token: string
): Promise<{ accessToken: string }> {
	const req: UpdateItemInput = {
		TableName,
		Key: { id: { S: id } },
		UpdateExpression: 'REMOVE accessToken',
		ConditionExpression: 'accessToken = :token',
		ExpressionAttributeValues: {
			':token': { S: token }
		},
		ReturnValues: 'UPDATED_OLD'
	};
	const res = await dynamoDB.updateItem(req).promise();
	if (res.Attributes.hasOwnProperty('accessToken')) {
		return { accessToken: token };
	} else {
		throw new UnauthorizedError();
	}
};

export const issueToken = async function(
	id: string,
	token: string
): Promise<{ id: string; expires: number }> {
	const expires = Date.now() + 3600 * 1000;
	const req: UpdateItemInput = {
		TableName,
		Key: { id: { S: id } },
		UpdateExpression: 'SET accessToken = :token, expiresOn = :expiresOn',
		ExpressionAttributeValues: {
			':token': { S: token },
			':expiresOn': { N: `${expires}` }
		},
		ReturnValues: 'UPDATED_NEW'
	};
	if (id !== adminId) {
		req.ConditionExpression = 'attribute_exists(is_admin) OR attribute_exists(department)';
	}
	const res = await dynamoDB.updateItem(req).promise();
	if (res.Attributes.hasOwnProperty('accessToken')) {
		return { id, expires };
	} else {
		throw new UnauthorizedError('Unauthorized', { id, expires });
	}
};

export const revokeLocker = async function(
	id: string,
	token: string
): Promise<{ id: string; lockerFloor?: string; lockerId?: string }> {
	const req: UpdateItemInput = {
		TableName,
		Key: { id: { S: id } },
		UpdateExpression: 'REMOVE lockerFloor, lockerId',
		ConditionExpression: 'accessToken = :token',
		ExpressionAttributeValues: {
			':token': { S: token }
		},
		ReturnValues: 'ALL_OLD'
	};
	const res = await dynamoDB.updateItem(req).promise();
	if (res.Attributes.accessToken?.S !== token) {
		throw new UnauthorizedError('Unauthorized');
	}
	if (res.Attributes.lockerId?.S) return { id, lockerId: res.Attributes.lockerId.S };
	return { id };
};

export const claimLocker = async function(
	id: string,
	token: string,
	lockerFloor: string,
	lockerId: string,
	claimedUntil?: number
): Promise<{ id: string; lockerFloor: string; lockerId: string; claimedUntil: number }> {
	if (!claimedUntil) claimedUntil = -1;
	const checkReq: QueryInput = {
		TableName,
		IndexName: 'lockerIdIndex',
		KeyConditionExpression: 'lockerFloor = :lockerFloor AND lockerId = :lockerId',
		FilterExpression: 'claimedUntil < :zero OR claimedUntil > :claimedUntil',
		ExpressionAttributeValues: {
			':zero': { N: '0' },
			':claimedUntil': { N: `${Date.now()}` },
			':lockerFloor': { S: lockerFloor },
			':lockerId': { S: lockerId }
		}
	};
	const checkRes = await dynamoDB.query(checkReq).promise();
	if (checkRes.Count > 0) throw new CantClaimError('Requested locker is already claimed');
	const req: UpdateItemInput = {
		TableName,
		Key: { id: { S: id } },
		UpdateExpression:
			'SET lockerFloor = :lockerFloor, lockerId = :lockerId, claimedUntil = :claimedUntil',
		ConditionExpression: 'accessToken = :token',
		ExpressionAttributeValues: {
			':lockerFloor': { S: lockerFloor },
			':lockerId': { S: lockerId },
			':token': { S: token },
			':claimedUntil': { N: `${claimedUntil}` }
		},
		ReturnValues: 'ALL_NEW'
	};
	const res = await dynamoDB.updateItem(req).promise();
	console.debug(res);
	if (
		res.Attributes.hasOwnProperty('lockerFloor') &&
		res.Attributes.lockerFloor?.S === lockerFloor &&
		res.Attributes.hasOwnProperty('lockerId') &&
		res.Attributes.lockerId?.S === lockerId
	) {
		return {
			id,
			claimedUntil,
			lockerFloor,
			lockerId
		};
	} else {
		if (res.Attributes?.accessToken?.S !== token) {
			throw new UnauthorizedError('Unauthorized', { id, lockerId, claimedUntil });
		}
		throw new CantClaimError('Can\'t claim requested locker', { id, lockerId, claimedUntil });
	}
};

export const getUserInfo = async function(id: string): Promise<UserInfo> {
	const req: GetItemInput = {
		TableName,
		Key: {
			id: {
				S: id
			}
		}
	};
	const res = await dynamoDB.getItem(req).promise();
	const ret: UserInfo = {
		id: id,
		isAdmin: res.Item.isAdmin?.BOOL ?? false,
		department: res.Item.department?.S as 'E' | 'A' | 'C' | 'S' | 'G'
	};
	if (res.Item.lockerId?.S) ret.lockerId = res.Item.lockerId.S;
	if (res.Item.claimedUntil?.N) ret.claimedUntil = parseInt(res.Item.claimedUntil.N);
	return ret;
};

const assertAdmin = async function(modId: string, token: string) {
	const authReq: GetItemInput = {
		TableName,
		Key: {
			id: {
				S: modId
			}
		}
	};
	const authRes = await dynamoDB.getItem(authReq).promise();
	if (
		authRes.Item.id.S !== modId ||
		authRes.Item.accessToken?.S !== token ||
		(authRes.Item.isAdmin?.BOOL !== true && modId !== adminId)
	) {
		throw new UnauthorizedError('Unauthorized');
	}
};

export const queryLockers = async function(
	department: string,
	showId?: boolean,
	modId?: string,
	token?: string
): Promise<Array<{ lockerFloor: string; lockerId: string; claimedUntil: number; id?: string }>> {
	if (showId && modId && token) {
		try {
			await assertAdmin(modId, token);
		} catch {
			showId = false;
		}
	}
	const req: QueryInput = {
		TableName,
		IndexName: 'lockerIdIndex',
		KeyConditionExpression: 'department = :department',
		FilterExpression: 'claimedUntil < :zero OR claimedUntil > :claimedUntil',
		ExpressionAttributeValues: {
			':zero': { N: '0' },
			':claimedUntil': { N: `${Date.now()}` },
			':department': { S: department }
		},
		ProjectionExpression: `lockerId, claimedUntil${showId ? ', id' : ''}`
	};
	const res = await dynamoDB.query(req).promise();
	return res.Items.map((item) => {
		const ret: { lockerFloor: string; lockerId: string; claimedUntil: number; id?: string } = {
			lockerFloor: item.lockerFloor?.S,
			lockerId: item.lockerId?.S,
			claimedUntil: parseInt(item.claimedUntil?.N)
		};
		if (showId) ret.id = item.id.S;
		return ret;
	});
};

export const updateUserInfo = async function(
	modId: string,
	token: string,
	info: { id: string; isAdmin?: boolean; department?: string }
): Promise<{ id: string; isAdmin?: boolean; department?: string }> {
	await assertAdmin(modId, token);
	const attributes: ExpressionAttributeValueMap = {};
	let updateExp = '';
	if (info.isAdmin !== undefined) {
		attributes[':isAdmin'] = { BOOL: info.isAdmin };
		updateExp = 'SET isAdmin = :isAdmin';
	}
	if (info.department) {
		attributes[':department'] = { S: info.department };
		updateExp += `${updateExp ? ',' : 'SET'} department = :department`;
	}
	const req: UpdateItemInput = {
		TableName,
		Key: {
			id: { S: info.id }
		},
		UpdateExpression: updateExp,
		ExpressionAttributeValues: attributes
	};
	await dynamoDB.updateItem(req).promise();
	const ret: { id: string; isAdmin?: boolean; department?: string } = { id: info.id };
	if (info.isAdmin !== undefined) ret.isAdmin = info.isAdmin;
	if (info.department) ret.department = info.department;
	return ret;
};

export const batchCreateUserInfo = async function(
	modId: string,
	token: string,
	infos: Array<{ id: string; department: string; isAdmin?: boolean }>
): Promise<Array<{ id: string; department: string; isAdmin?: boolean }>> {
	if (infos.length === 0) return infos;
	if (infos.length > 25) throw new ResponsibleError('Maximum amount of batch creation is 25');
	const authReq: GetItemInput = {
		TableName,
		Key: {
			id: {
				S: modId
			}
		}
	};
	const authRes = await dynamoDB.getItem(authReq).promise();
	if (authRes.Item.id.S !== modId || authRes.Item.accessToken?.S !== token) {
		throw new UnauthorizedError('Unauthorized');
	}
	const requests: WriteRequest[] = infos.map((v) => ({
		PutRequest: {
			Item: {
				id: { S: v.id },
				department: { S: v.department },
				isAdmin: { BOOL: v.isAdmin === undefined ? false : v.isAdmin }
			}
		}
	}));
	const req: BatchWriteItemInput = {
		RequestItems: {
			TableName: requests
		}
	};
	await dynamoDB.batchWriteItem(req).promise();
	return infos;
};

export const getClaimedLockers = async () => {
	const req: ScanInput = {
		TableName,
		IndexName: 'lockerIdIndex'
	};
	const res = await dynamoDB.scan(req).promise();
	return res.Items.map((value) => ({
		lockerFloor: value.lockerFloor.S,
		lockerId: value.lockerId.S
	}));
};
