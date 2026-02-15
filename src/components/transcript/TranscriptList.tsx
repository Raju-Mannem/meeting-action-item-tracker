import { Transcript } from "@/store/slices/transcriptSlice";
import clsx from "clsx";
import { Trash2 } from "lucide-react";

interface TranscriptListProps {
  transcripts: Transcript[];
  selectedId: string | null;
  selectedWorkspaceId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export const TranscriptList = ({
  transcripts,
  selectedId,
  selectedWorkspaceId,
  onSelect,
  onDelete,
  onNew,
}: TranscriptListProps) => {
  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          {selectedWorkspaceId ? "Saved Transcripts" : "Local History"}
        </h3>
        {selectedWorkspaceId && (
          <button
            onClick={onNew}
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            + New
          </button>
        )}
      </div>

      <div className="space-y-1">
        {transcripts.length === 0 ? (
          <div className="text-xs text-zinc-400 italic p-2">
            No transcripts found.
          </div>
        ) : (
          transcripts.map((t) => (
            <div key={t.id} className="group flex items-center gap-1">
              <button
                onClick={() => onSelect(t.id)}
                className={clsx(
                  "flex-1 text-left text-sm py-2 px-3 rounded-md truncate transition-colors",
                  selectedId === t.id
                    ? "bg-white shadow-sm text-red-600 font-medium border border-red-200"
                    : "text-zinc-600 hover:bg-zinc-200/50",
                )}
              >
                <div className="flex justify-between items-center">
                  <span>{t.content.slice(0, 15)}...</span>
                  <span className="text-xs bg-zinc-200 dark:bg-zinc-800 px-1.5 rounded-full text-zinc-600">
                    {t.actionItems.length}
                  </span>
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(t.id);
                }}
                className="p-1.5 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
