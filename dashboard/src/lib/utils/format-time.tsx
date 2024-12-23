export const formatTime = (ms: number | string, key: string) => {
	const value = typeof ms === 'string' ? parseInt(ms) : ms;
	const hours = Math.floor(value / (1000 * 60 * 60));
	const minutes = Math.floor((value % (1000 * 60 * 60)) / (1000 * 60));
	return `${key}: ${hours}h ${minutes}m`;
};
export const formatHours = (
	ms: number | string,
	key?: string,
	short = false
) => {
	const value = typeof ms === 'string' ? parseInt(ms) : ms;
	const hours = Math.floor(value / (1000 * 60 * 60));
	return key
		? `${key}: ${hours} ${short ? 'hrs' : ' Hours'} `
		: `${hours}${short ? 'hrs' : ' Hours'}`;
};
