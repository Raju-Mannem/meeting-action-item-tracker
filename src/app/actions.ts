'use server';

import { processTranscript } from '@/lib/llmService';
import { ActionItem } from '@/store/slices/transcriptSlice';

export async function processTranscriptAction(text: string): Promise<ActionItem[]> {
    try {
        const items = await processTranscript(text);
        return items;
    } catch (error) {
        console.error("Server Action Error:", error);
        return [];
    }
}
