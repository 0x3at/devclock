export type Heartbeat = {
    timestamp: number;
    eventType: string;
    filePath?: string;
    fileName?: string;
    lineCount?: number;
    changeCount?: number;
    currentLanguage?: string;
}