import { Notice } from 'obsidian';

export class ImprovedRandomNoteNotice extends Notice {
    constructor(message: string, timeout?: number) {
        super('Improved Random Note: ' + message, timeout);
    }
}
