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
