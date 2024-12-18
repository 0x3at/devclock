import { StatusBarAlignment, window } from 'vscode';
import { State } from '../shared/enums/state.s.e';
import { toTimeStamp } from '../utils/time';

export const StatusBarTimerConstructor = () => {
	let icons = new Map<State, string>();
	icons.set(State.active, `$(symbol-event)`);
	icons.set(State.debug, `$(debug-alt)`);
	icons.set(State.idle, `$(stop-circle)`);
	let timer = window.createStatusBarItem(
		'devclock.timer',
		StatusBarAlignment.Left,
		100
	);
	timer.show();
	return {
		icons,
		timer,
		tick: (state: State, time: number) => {
			timer.text = `${icons.get(state)} ${toTimeStamp(time)}`;
		},
	};
};
