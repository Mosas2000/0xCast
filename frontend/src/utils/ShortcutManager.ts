/**
 * Global keyboard shortcut manager for enhanced navigation efficiency.
 */
export class ShortcutManager {
    private static handlers: Record<string, () => void> = {};

    /**
     * Initializes the global keydown listener.
     */
    static init(): void {
        window.addEventListener('keydown', (e) => {
            // Avoid triggering shortcuts when typing in inputs
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            const key = e.key.toLowerCase();
            if (this.handlers[key]) {
                e.preventDefault();
                this.handlers[key]();
            }
        });
    }

    /**
     * Registers a handler for a specific key.
     */
    static register(key: string, handler: () => void): void {
        this.handlers[key.toLowerCase()] = handler;
    }

    /**
     * Unregisters a handler for a specific key.
     */
    static unregister(key: string): void {
        delete this.handlers[key.toLowerCase()];
    }
}
