import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";

// Utility functions for generating random data
const generateRandomString = (length: number = 10): string =>
    Math.random()
        .toString(36)
        .substring(2, 2 + length);

const generateRandomContent = (
    minLines: number = 1,
    maxLines: number = 10
): string =>
    Array.from(
        {
            length:
                Math.floor(Math.random() * (maxLines - minLines + 1)) + minLines
        },
        () => generateRandomString(20)
    ).join("\n");

// File management functions
const createTempFile = async (baseDir: string): Promise<vscode.Uri> => {
    const filename = `memory_test_${Date.now()}.html`;
    const filePath = path.join(baseDir, filename);
    fs.writeFileSync(filePath, '', { encoding: 'utf-8' });
    return vscode.Uri.file(filePath);
};

// Console output capture class remains the same...
class ConsoleCapture {
    // ... existing implementation ...
}

suite("Continuous Write and File Management Test", function () {
    this.timeout(12 * 60 * 60 * 1000); // 12 hours timeout

    test("Continuous file writing simulation", async function () {
        // Activate the extension first
        await vscode.extensions.getExtension("devclock.devclock")?.activate();

        // Setup directories and log files
        const testDir = path.join(__dirname, "test_outputs");
        fs.mkdirSync(testDir, { recursive: true });
        const consoleLogFile = path.join(testDir, "console_output.log");
        const consoleCapture = new ConsoleCapture();

        try {
            // Create and open single test file
            const testFileUri = await createTempFile(testDir);
            const document = await vscode.workspace.openTextDocument(testFileUri);
            const editor = await vscode.window.showTextDocument(document);

            const startTime = Date.now();
            const endTime = startTime + (12 * 60 * 60 * 1000); // 12 hours

            while (Date.now() < endTime) {
                try {
                    // Generate and write content
                    const randomContent = generateRandomContent();
                    await editor.edit(editBuilder => {
                        const position = new vscode.Position(document.lineCount, 0);
                        editBuilder.insert(position, randomContent + '\n');
                    });

                    // Auto-save without user interaction (20% chance)
                    if (Math.random() < 0.2) {
                        await document.save();
                    }

                    // Delete some content (10% chance)
                    if (Math.random() < 0.1 && document.lineCount > 10) {
                        await editor.edit(editBuilder => {
                            const startLine = Math.max(0, document.lineCount - 5);
                            const endLine = document.lineCount;
                            const range = new vscode.Range(
                                new vscode.Position(startLine, 0),
                                new vscode.Position(endLine, 0)
                            );
                            editBuilder.delete(range);
                        });
                        await document.save();
                    }

                    // Random delay between operations (1-6 seconds)
                    await new Promise(resolve =>
                        setTimeout(resolve, Math.random() * 5000 + 1000)
                    );

                } catch (iterationError) {
                    console.error('Iteration error:', iterationError);
                }
            }

            // Verification
            const logContent = fs.readFileSync(consoleLogFile, 'utf-8');
            assert.ok(logContent.includes('DataStore Memory Consumption'),
                'Should contain memory consumption logs');

        } catch (error) {
            console.error('Test error:', error);
			throw error;
		}
	});
});
