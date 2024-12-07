import {
	MILLISECONDS_IN_SECOND,
	MINUTES_IN_HOUR,
	SECONDS_IN_MINUTE,
	START_TIME
} from "../constants/globalconstants";

// Core Types
type TimeUnit = "milliseconds" | "seconds" | "minutes" | "hours";
type TimeOption = "m" | "S" | "M" | "H";
export type TimeStamp = {
	hours: number;
	minutes: number;
	seconds: number;
};

// Conversion Constants
const CONVERSIONS = {
	milliseconds: 1,
	seconds: MILLISECONDS_IN_SECOND,
	minutes: MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE,
	hours: MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE * MINUTES_IN_HOUR
} as const;

// Core Conversion Function
const convert = (value: number, from: TimeUnit, to: TimeUnit): number =>{
	if (isNaN(value)) {
        console.error('Convert received NaN value', { value, from, to });
        return 0;
    }
	return Math.trunc((value * CONVERSIONS[from]) / CONVERSIONS[to]);
};
// Time Conversion API
export const TimeConverter = {
	toMilliseconds: (value: number, from: Exclude<TimeUnit, "milliseconds">) =>
		convert(value, from, "milliseconds"),
	fromMilliseconds: (value: number, to: Exclude<TimeUnit, "milliseconds">) =>
		convert(value, "milliseconds", to),
	between: (value: number, from: TimeUnit, to: TimeUnit) =>
		convert(value, from, to)
} as const;

// Current Time Utilities
const TIME_UNIT_MAP: Record<TimeOption, TimeUnit> = {
	m: "milliseconds",
	S: "seconds",
	M: "minutes",
	H: "hours"
} as const;

const getCurrentTime = (unit: TimeUnit): number =>
	unit === "milliseconds"
		? Date.now()
		: TimeConverter.fromMilliseconds(Date.now(), unit);

export const CurrentTime = (option: TimeOption): number =>
	getCurrentTime(TIME_UNIT_MAP[option]);

// TimeStamp Conversion
export const ToTimeStamp = (milliseconds: number): TimeStamp => {
    if (isNaN(milliseconds)) {
        console.error('ToTimeStamp received NaN', { milliseconds });
        return { hours: 0, minutes: 0, seconds: 0 };
    }

    const totalSeconds = Math.floor(milliseconds / MILLISECONDS_IN_SECOND);
    const hours = Math.floor(totalSeconds / (SECONDS_IN_MINUTE * MINUTES_IN_HOUR));
    const remainingMinutes = Math.floor((totalSeconds % (SECONDS_IN_MINUTE * MINUTES_IN_HOUR)) / SECONDS_IN_MINUTE);
    const seconds = totalSeconds % SECONDS_IN_MINUTE;

    return {
        hours,
        minutes: remainingMinutes,
        seconds
    };
};

// Working Time Utilities
export const CurrentWorkingTime = {
	milliseconds: () => Date.now() - START_TIME,
	seconds: () =>
		TimeConverter.fromMilliseconds(Date.now() - START_TIME, "seconds"),
	minutes: () =>
		TimeConverter.fromMilliseconds(Date.now() - START_TIME, "minutes"),
	hours: () =>
		TimeConverter.fromMilliseconds(Date.now() - START_TIME, "hours")
} as const;
