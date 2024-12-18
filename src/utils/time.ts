const formatTimeDisplay = (timestamp: any): string => {
	const { hours, minutes, seconds } = timestamp;
	return `${hours}hrs ${minutes}mins ${seconds}s`;
};

export const toTimeStamp = (milliseconds: number) => {
	if (isNaN(milliseconds)) {
		console.error('ToTimeStamp received NaN', { milliseconds });
		return { hours: 0, minutes: 0, seconds: 0 };
	}

	let totalSeconds = Math.floor(milliseconds / 1000);
	let hours = Math.floor(totalSeconds / (60 * 60));
	let remainingMinutes = Math.floor((totalSeconds % (60 * 60)) / 60);
	let seconds = totalSeconds % 60;

	return formatTimeDisplay({
		hours,
		minutes: remainingMinutes,
		seconds,
	});
};
