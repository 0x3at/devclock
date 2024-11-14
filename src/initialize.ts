import { CONTEXT } from "./core/globalconstants";
import { InitializeGui } from "./sideEffects/gui/initialize";
import {
	debugEnd,
	debugStart,
	docClosed,
	docOpened,
	docSaved,
	textChanged
} from "./vsc/listeners/vsceventlisteners";

export const initializeExtension = () => {
	const LtextChanged = textChanged().disposable;
	const LdocOpened = docOpened().disposable;
	const LdocClosed = docClosed().disposable;
	const LdocSaved = docSaved().disposable;
	const LdebugStart = debugStart().disposable;
	const LdebugEnd = debugEnd().disposable;

	//* Non Pure buts its vsc what can you do
	CONTEXT.getContext()!.subscriptions.push(LtextChanged);
	CONTEXT.getContext()!.subscriptions.push(LdocOpened);
	CONTEXT.getContext()!.subscriptions.push(LdocClosed);
	CONTEXT.getContext()!.subscriptions.push(LdocSaved);
	CONTEXT.getContext()!.subscriptions.push(LdebugStart);
	CONTEXT.getContext()!.subscriptions.push(LdebugEnd);

	const gui = InitializeGui();
};
