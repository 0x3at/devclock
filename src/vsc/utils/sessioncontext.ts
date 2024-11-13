import { ExtensionContext } from "vscode";

export const sessionContext = () =>{
    let context:ExtensionContext|null = null;
    return {
        getContext: () => context,
        setContext: (c:ExtensionContext) => {
            context = c;
        },
    };
};