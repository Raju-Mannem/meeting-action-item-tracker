'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { Loader2, Briefcase, Plus, Trash2, Edit2, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { GET_WORKSPACES, DELETE_WORKSPACE, UPDATE_WORKSPACE } from '@/lib/graphql/queries';

interface Workspace {
    id: string;
    name: string;
    createdAt: string;
}

interface WorkspaceListProps {
    selectedId: string | null;
    onSelect: (workspaceId: string) => void;
    onCreateNew: () => void;
}

export default function WorkspaceList({ selectedId, onSelect, onCreateNew }: WorkspaceListProps) {
    const { data: session } = useSession();
    const { data, loading, error, refetch } = useQuery<{ workspaces: Workspace[] }>(GET_WORKSPACES, {
        variables: { userId: (session?.user as unknown as { id: string })?.id },
        skip: !session?.user,
        fetchPolicy: 'cache-and-network'
    });

    const [deleteWorkspace] = useMutation(DELETE_WORKSPACE);
    const [updateWorkspace] = useMutation(UPDATE_WORKSPACE);

    if (!session) {
        return (
            <div className="p-4 text-center text-sm text-zinc-500">
                Sign in to view workspaces.
            </div>
        )
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Delete this workspace and all its transcripts?")) return;
        try {
            await deleteWorkspace({ variables: { id } });
            refetch();
            if (selectedId === id) onSelect('');
        } catch (err) {
            console.error(err);
            alert("Failed to delete workspace.");
        }
    };

    const handleRename = async (e: React.MouseEvent | React.KeyboardEvent, id: string, oldName: string) => {
        e.stopPropagation();
        const newName = prompt("New Workspace Name:", oldName);
        if (newName && newName !== oldName) {
            try {
                await updateWorkspace({ variables: { input: { id, name: newName } } });
                refetch();
            } catch (err) {
                alert("Failed to update workspace.");
            }
        }
    };


    const workspaces = data?.workspaces || [];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-[18px] bg-white border-b border-red-200 dark:border-zinc-800">
                <h2 className="font-semibold text-sm">Workspaces</h2>
                <div className="flex gap-1">
                    <button
                        onClick={() => refetch()}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-red-600"
                        title="Refresh Workspaces"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onCreateNew}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-red-600"
                        title="Create Workspace"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-1 mx-4">
                {loading && <div className="flex justify-center p-2"><Loader2 className="w-4 h-4 animate-spin text-zinc-400" /></div>}
                {error && <p className="text-xs text-red-500 px-2">Error loading workspaces.</p>}

                {!loading && workspaces.length === 0 && (
                    <p className="text-sm text-zinc-500 px-2">No workspaces found.</p>
                )}

                {workspaces.map((ws: Workspace) => (
                    <div
                        key={ws.id}
                        onClick={() => onSelect(ws.id)}
                        className={clsx(
                            "group relative w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all cursor-pointer border border-transparent",
                            selectedId === ws.id
                                ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 font-medium shadow-sm"
                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        )}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <Briefcase className={clsx("w-4 h-4 flex-shrink-0", selectedId === ws.id ? "text-red-600" : "text-zinc-400")} />
                            <span className="truncate">{ws.name}</span>
                        </div>

                        {/* Actions (Visible on hover or selected) */}
                        <div className={clsx("flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", selectedId === ws.id && "opacity-100")}>
                            <button
                                onClick={(e) => handleRename(e, ws.id, ws.name)}
                                className="p-1 hover:text-red-600 rounded text-zinc-400"
                                title="Rename"
                            >
                                <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                                onClick={(e) => handleDelete(e, ws.id)}
                                className="p-1 hover:text-red-600 rounded text-zinc-400"
                                title="Delete"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
