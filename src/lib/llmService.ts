"use server";

import { ActionItem, ActionItemStatus } from "@/store/slices/transcriptSlice";
import { v4 as uuidv4 } from 'uuid';
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});


interface RawLlmResponse {
    actionItems?: Array<{
        task: string;
        owner?: string | null;
        dueDate?: string | null;
        status?: ActionItemStatus | null;
    }>;
}

export const processTranscript = async (text: string): Promise<ActionItem[]> => {
    // 1. Validation & Guard Clauses
    if (!text || text.trim().length < 10) {
        return [];
    }

    if (!process.env.GROQ_API_KEY) {
        console.error("[ProcessTranscript] Configuration Error: GROQ_API_KEY is missing.");
        return fallbackRegexParser(text);
    }

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a Project Management AI. Extract action items from meeting transcripts.
                    Output a JSON object with an "actionItems" array. 
                    Each item must have:
                    - "task": (string) Verb-first description.
                    - "owner": (string or null) The assignee.
                    - "dueDate": (string or null) Mentioned deadline.
                    - "status": (OPEN or DONE or null) The status of the task.

                    Constraints:
                    - Only include items that are clear commitments.
                    - Respond ONLY with valid JSON.`,
                },
                {
                    role: "user",
                    content: `Transcript: ${text}`,
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const rawContent = completion.choices[0]?.message?.content;
        
        if (!rawContent) {
            throw new Error("Empty response from Groq API");
        }

        const parsed: RawLlmResponse = JSON.parse(rawContent);
        const rawItems = parsed.actionItems || [];

        return rawItems.map(item => ({
            id: uuidv4(),
            task: sanitizeString(item.task, "Unspecified Task"),
            owner: item.owner || undefined,
            dueDate: item.dueDate || undefined,
            status: item.status || 'OPEN',
        }));

    } catch (error) {
        console.error("[ProcessTranscript] Extraction failed:", error);
        return fallbackRegexParser(text);
    }
};

/**
 * Fallback logic using regex for resilience if the LLM fails or is unconfigured.
 */
const fallbackRegexParser = (text: string): ActionItem[] => {
    const lines = text.split('\n');
    return lines
        .filter(line => /^(action|task|todo|[\-\*])/i.test(line.trim()))
        .map((line): ActionItem => ({
            id: uuidv4(),
            task: line.replace(/^(?:Action|Task|TODO|[\-\*])\s*:?\s*/i, '').trim(),
            status: 'OPEN',
        }))
        .filter(item => item.task.length > 0);
};

const sanitizeString = (val: any, fallback: string): string => {
    return typeof val === 'string' && val.trim() !== '' ? val.trim() : fallback;
};