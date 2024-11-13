import { TextChangeListener } from "./vsc/listeners/vsceventlisteners";
import { saveTextChangeHeartbeat } from "./core/dataStore/pipes";


export const initializeExtension = () => {
    const textChangeListener = TextChangeListener(saveTextChangeHeartbeat);
};
