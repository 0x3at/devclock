import { Disposable, ExtensionContext } from "vscode";

const ContextStore = () => {
	let _ctx: ExtensionContext;
	return {
		set: (ctx: ExtensionContext) => (_ctx = ctx),
		context: () => _ctx,
		addDisposable: (d: Disposable) => _ctx.subscriptions.push(d),
	};
};

export const Context = ContextStore();