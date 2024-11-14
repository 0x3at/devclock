import { statusBarTimer} from "./actions";

export const InitializeGui = () => {
    let statusBar = statusBarTimer();

    // Initialize the status bar
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


