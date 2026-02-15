'use client';

import { useState, useEffect } from 'react';
import { Loader2, Wand2 } from 'lucide-react';

interface TranscriptEditorProps {
    initialContent: string;
    isProcessing: boolean;
    onProcess: (text: string) => void;
    onUpdateContent: (text: string) => void;
    readOnly?: boolean;
}

export const TranscriptEditor = ({ initialContent, isProcessing, onProcess, onUpdateContent, readOnly = false }: TranscriptEditorProps) => {
    const [text, setText] = useState(initialContent);

    useEffect(() => {
        setText(initialContent);
    }, [initialContent]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        setText(newText);
        onUpdateContent(newText);
    };

    const handleProcess = () => {
        if (!text.trim() || isProcessing) return;
        onProcess(text);
    };

    return (
        <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-900/50 rounded-xl border-none shadow-sm">
            <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-red-200 dark:border-zinc-800">
                <span className="font-medium text-sm text-zinc-700 dark:text-zinc-300">Transcript</span>
                <button
                    onClick={handleProcess}
                    disabled={isProcessing || !text.trim() || readOnly}
                    className="flex items-center gap-2 bg-red-500 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-600 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Wand2 className="w-3.5 h-3.5" />
                            Process
                        </>
                    )}
                </button>
            </div>

            <textarea
                value={text}
                onChange={handleChange}
                disabled={readOnly}
                placeholder="Paste your meeting transcript here..."
                className="flex-1 w-full p-4 resize-none bg-transparent outline-none text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 font-mono  overflow-y-scroll scrollbar-thin scrollbar-thumb-black scrollbar-track-black/10"
                style={{ minHeight: '360px' }}
            />
        </div>
    );
};
