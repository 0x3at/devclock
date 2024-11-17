import { StatusBarAlignment, StatusBarItem, window } from "vscode";
import { IdleStateManager } from "../../domain/session/idleactions";
import { DATASTORE, START_TIME } from "../../shared/constants/globalconstants";
import { AppPreferences } from "../../shared/constants/settings";
import { absSubtract } from "../../shared/utils/maths";
import { CurrentTime, TimeStamp, ToTimeStamp } from "../../shared/utils/time";


export type StatusBarTimer = () => {
	show: () => void;
	start: () => NodeJS.Timeout;
	tooltip: (text: string) => void;
	hide: () => void;
	disposable: () => StatusBarItem;
};

export const statusBarTimer: StatusBarTimer = () => {
	let idleStateManager: IdleStateManager = DATASTORE.getIdleStateManager();
	let statusBarItem: StatusBarItem = window.createStatusBarItem(
		StatusBarAlignment[
			AppPreferences.timerAlignment.get() as keyof typeof StatusBarAlignment
		],
		100
	);

	idleStateManager.startIdleTimer();

	const formatTimeDisplay = (timestamp: TimeStamp): string => {
		const { hours, minutes, seconds } = timestamp;
		return `${hours}hrs ${minutes}mins ${seconds}s`;
	};

	const updateDisplay = () => {
		const currentTime = CurrentTime("m");
		const totalTime = absSubtract(currentTime, START_TIME);
		const idleTime = idleStateManager.updateIdleTime();
		const activeTime = Math.max(0, totalTime - idleTime);

		const timeDisplay = idleStateManager.getState().isIdle
			? formatTimeDisplay(ToTimeStamp(idleTime))
			: formatTimeDisplay(ToTimeStamp(activeTime));

		const icon = idleStateManager.getState().isIdle
			? "$(alert)IDLE"
			: "$(watch)";
		statusBarItem.text = `${icon} ${timeDisplay}`;
	};

	return {
		show: () => statusBarItem.show(),
		start: () => setInterval(updateDisplay, 1000),
		tooltip: (text = "Current Coding Session Time!") => {
			statusBarItem.tooltip = text;
		},
		hide: () => statusBarItem.hide(),
		disposable: () => statusBarItem
	};
};
