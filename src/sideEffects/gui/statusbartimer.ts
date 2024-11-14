import { StatusBarItem, window, StatusBarAlignment } from "vscode";
import { START_TIME } from "../../core/globalconstants";
import { CurrentTime } from "../../core/utils/intUtils/time";
import { ToTimeStamp } from "../../core/utils/intUtils/time";
import { absSubtract } from "../../core/utils/intUtils/maths";
import { DATASTORE } from "../../core/globalconstants";
import { TimeStamp } from "../../core/utils/intUtils/time";
import { IdleStateManager } from "../../core/dataStore/idlestate";
// //TODO: Replace alignment with preferences map

export type StatusBarTimer = () => {
	show: () => void;
	start: () => NodeJS.Timeout;
	tooltip: (text: string) => void;
	hide: () => void;
	dispose: () => void;
};

export const statusBarTimer: StatusBarTimer = () => {
	let idleStateManager: IdleStateManager = DATASTORE.getIdleStateManager();
	const statusBarItem: StatusBarItem = window.createStatusBarItem(
		StatusBarAlignment.Left,
		100
	);

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
		dispose: () => statusBarItem.dispose()
	};
};

//!Deprecated
// export const statusBarTimer = () => {
//     let statusBarItem:StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 100);

//     return{
//         show: () => {statusBarItem.show();},
//         StampTime: () =>{
//             return setInterval(() => {
//                 const currentTimestamp:TimeStamp = ToTimeStamp(absSubtract(CurrentTime("m"), START_TIME));
//                 const idleOffset:TimeStamp = ToTimeStamp(DATASTORE.getTotalIdleTime());
//                 const timeStamp:TimeStamp = {
//                     hours: currentTimestamp.hours - idleOffset.hours,
//                     minutes: currentTimestamp.minutes - idleOffset.minutes,
//                     seconds: currentTimestamp.seconds - idleOffset.seconds
//                 };
//                 statusBarItem.text = DATASTORE.getState() === Events.idle ? `$(alert)IDLE ${idleOffset.hours}hrs ${idleOffset.minutes}mins ${idleOffset.seconds}s ` : `$(watch) ${timeStamp.hours}hrs ${timeStamp.minutes}mins ${timeStamp.seconds}s `;
//             }, 1000);
//         },
//         tooltip: (tooltip:string = "Current Coding Session Time!") =>{statusBarItem.tooltip = tooltip;},
//         hide: () =>{statusBarItem.hide();},
//         disposable: () =>{return statusBarItem;}
//     };
// };
