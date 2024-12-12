/** @format */

import { Details } from './details.s.t';

export type Session = {
	appName: string;
	sessionID: string;
	startTime: number;
	duration: number;
	activeTime: number;
	debugTime: number;
	idleTime: number;
	details: Details;
};
