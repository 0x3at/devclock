// // vscode/listeners.ts

// import * as vscode from 'vscode';

// const TextChangeListener = (callback: (e: vscode.TextDocumentChangeEvent) => void) => {
//   // This function sets up the event listener for text changes
//   const disposable = vscode.workspace.onDidChangeTextDocument((e) => {
//     callback(e); // Execute the callback whenever the text document changes
//   });

//   // Optionally, you could return a function to stop listening to the event
//   return () => disposable.dispose(); // Returns a function that can stop the listener
// };

// export default TextChangeListener;

import { workspace as ws, TextDocumentChangeEvent } from 'vscode';

export const TextChangeListener = (callback: (e: TextDocumentChangeEvent) => void) => {
    let disposable = ws.onDidChangeTextDocument((e: TextDocumentChangeEvent) => {
        callback(e);
    });
    return {
        pause: () => disposable.dispose(),
        resume: () =>
            disposable = ws.onDidChangeTextDocument((e: TextDocumentChangeEvent) => {
                callback(e);
            })
    };
};

