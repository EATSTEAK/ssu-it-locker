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
	}[department]);

export const parseFloor = (floor: string) => [
	{ H: '형남공학관', I: '정보과학관' }[floor.split('-')[0]],
	floor.split('-')[1]
];

export const range = (size: number, startAt = 0) => [...Array(size).keys()].map((i) => i + startAt);
