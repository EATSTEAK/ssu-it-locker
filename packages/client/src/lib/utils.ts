export const getCookieValue = (name: string) =>
	document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || '';

export const getAuthorization = () => getCookieValue('ssulocker_session');

export const fetchWithAuth = (resource: RequestInfo, init?: RequestInit) =>
	fetch(resource, {
		...init,
		headers: {
			Authorization: `Bearer ${getAuthorization()}`,
			...init?.headers
		}
	});

export type LockerMap = {
	[floor: string]: {
		[section: string]: {
			range: number[];
			department: 'E' | 'A' | 'C' | 'S' | 'G';
		}[];
	};
};

export const getDepartment = (department: 'E' | 'A' | 'C' | 'S' | 'G'): string =>
	({
		E: '전자정보공학부',
		A: 'AI융합학부',
		C: '컴퓨터학부',
		S: '소프트웨어학부',
		G: '글로벌미디어학부'
	}[department] ?? '정보 없음');

export const getBuilding = (building: string) => ({ H: '형남공학관', I: '정보과학관' }[building]);

export const parseFloor = (floor: string) => [
	getBuilding(floor.split('-')[0]),
	floor.split('-')[1]
];

export const range = (size: number, startAt = 0) => [...Array(size).keys()].map((i) => i + startAt);

function toClassName(value: string | number | object) {
	let result = '';

	if (typeof value === 'string' || typeof value === 'number') {
		result += value;
	} else if (typeof value === 'object') {
		if (Array.isArray(value)) {
			result = value.map(toClassName).filter(Boolean).join(' ');
		} else {
			for (const key in value) {
				if (value[key]) {
					// eslint-disable-next-line @typescript-eslint/no-unused-expressions
					result && (result += ' ');
					result += key;
				}
			}
		}
	}

	return result;
}

export function classnames(...args) {
	return args.map(toClassName).filter(Boolean).join(' ');
}
