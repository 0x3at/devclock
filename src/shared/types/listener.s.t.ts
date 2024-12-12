/** @format */

import { Disposable } from 'vscode';
import { EventPayload } from './generic.s.t';

export type VSCListener = {
	pause: () => void;
	resume: () => void;
	disposable: Disposable;
};

export type CustomListener = {
	emit: (payload: EventPayload) => void;
	pause: () => void;
	resume: () => void;
};
