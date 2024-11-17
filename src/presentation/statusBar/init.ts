import { statusBarTimer } from "./timer.actions";

export const InitializeGuiTimer = () => {
    let statusBar = statusBarTimer();

    const initializeStatusBar = () => {
        const intervalId = statusBar.start();
        statusBar.tooltip("Current Coding Session Time!");
        statusBar.show();
        return {
            statusBar,
            intervalId
        };
    };

    const initialized = initializeStatusBar();

    return {
        clearInterval: (): void => clearInterval(initialized.intervalId),
        statusBar: initialized.statusBar,
    };
};