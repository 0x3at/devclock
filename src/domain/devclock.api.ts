/** @format */

import { ExtensionContext } from 'vscode';
import { StateManager } from './state/dep.manager.state';

const Devclock = (ctx: ExtensionContext) => {
	let stateManager;
	let adapter;
	let eventQueue;

	let initialize = () => {
		stateManager = StateManager();
	};
};
