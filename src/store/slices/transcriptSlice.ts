import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transcript {
    id: string;
    content: string;
    createdAt: string;
    actionItems: ActionItem[];
}

export type ActionItemStatus = 'OPEN' | 'DONE';

export interface ActionItem {
    id: string;
    task: string;
    owner?: string;
    dueDate?: string;
    status: ActionItemStatus;
}

interface TranscriptState {
    transcripts: Transcript[];
}

const initialState: TranscriptState = {
    transcripts: [],
};

const transcriptSlice = createSlice({
    name: 'transcript',
    initialState,
    reducers: {
        addTranscript: (state, action: PayloadAction<Transcript>) => {
            state.transcripts.unshift(action.payload);
            if (state.transcripts.length > 5) {
                state.transcripts.pop(); // Keep only last 5 locally
            }
        },
        updateTranscript: (state, action: PayloadAction<Transcript>) => {
            const index = state.transcripts.findIndex((t) => t.id === action.payload.id);
            if (index !== -1) {
                state.transcripts[index] = action.payload;
            }
        },
        removeTranscript: (state, action: PayloadAction<string>) => {
            state.transcripts = state.transcripts.filter((t) => t.id !== action.payload);
        },
        updateActionItemStatus: (state, action: PayloadAction<{ transcriptId: string; actionItemId: string; status: 'OPEN' | 'DONE' }>) => {
            const transcript = state.transcripts.find((t) => t.id === action.payload.transcriptId);
            if (transcript) {
                const item = transcript.actionItems.find((i) => i.id === action.payload.actionItemId);
                if (item) {
                    item.status = action.payload.status;
                }
            }
        },
        deleteActionItem: (state, action: PayloadAction<{ transcriptId: string; actionItemId: string }>) => {
            const transcript = state.transcripts.find((t) => t.id === action.payload.transcriptId);
            if (transcript) {
                transcript.actionItems = transcript.actionItems.filter((i) => i.id !== action.payload.actionItemId);
            }
        },
        editActionItem: (state, action: PayloadAction<{ transcriptId: string; actionItemId: string; updates: Partial<ActionItem> }>) => {
            const transcript = state.transcripts.find((t) => t.id === action.payload.transcriptId);
            if (transcript) {
                const item = transcript.actionItems.find((i) => i.id === action.payload.actionItemId);
                if (item) {
                    Object.assign(item, action.payload.updates);
                }
            }
        },
        addActionItem: (state, action: PayloadAction<{ transcriptId: string; item: ActionItem }>) => {
            const transcript = state.transcripts.find((t) => t.id === action.payload.transcriptId);
            if (transcript) {
                transcript.actionItems.push(action.payload.item);
            }
        },
    },
});

export const {
    addTranscript,
    updateTranscript,
    removeTranscript,
    updateActionItemStatus,
    deleteActionItem,
    editActionItem,
    addActionItem
} = transcriptSlice.actions;
export default transcriptSlice.reducer;
