import type { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import lockerData from './lockers.json';

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

type LockerMap = {
	[floor: string]: {
		[section: string]: {
			range: number[];
			department: 'E' | 'A' | 'C' | 'S' | 'G';
		}[];
	};
};

export const lockers: LockerMap = lockerData as LockerMap;

export function isValidLocker(
	lockerFloor: string,
	lockerId: string,
	department?: 'E' | 'A' | 'C' | 'S' | 'G'
): boolean {
	const parsedLockerId = lockerId.split('-');
	const lockerSectionNum = parseInt(parsedLockerId[1]);
	const selectedSections = lockers?.[lockerFloor]?.[parsedLockerId[0]];
	if (parsedLockerId.length !== 2) return false;
	if (!selectedSections) return false;
	const section = selectedSections.find(
		(sect) =>
			sect.range[0] <= lockerSectionNum &&
			sect.range[1] >= lockerSectionNum &&
			(department === undefined || department === sect.department)
	);
	return section !== undefined;
}

export function getLockerDepartment(
	lockerFloor: string,
	lockerId: string
): 'E' | 'A' | 'C' | 'S' | 'G' {
	const parsedLockerId = lockerId.split('-');
	const lockerSectionNum = parseInt(parsedLockerId[1]);
	const selectedSections = lockers?.[lockerFloor]?.[parsedLockerId[0]];
	if (parsedLockerId.length !== 2) throw new Error('Given locker is not valid');
	if (!selectedSections) throw new Error('Given locker is not valid');
	const section = selectedSections.find(
		(sect) => sect.range[0] <= lockerSectionNum && sect.range[1] >= lockerSectionNum
	);
	if (section) return section.department;
	else throw new Error('Given locker is not valid');
}

// eslint-disable-next-line @typescript-eslint/require-await
export const localCorsHandler: APIGatewayProxyHandler = async () => {
	return {
		statusCode: 200,
		headers: {
			'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
			'Access-Control-Allow-Methods': 'POST, GET',
			'Access-Control-Allow-Origin': '*'
		},
		body: ''
	};
};
