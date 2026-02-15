"use client";

import { useState, useEffect } from "react";
import ActionItemFlow from "@/components/ActionItemFlow";
import WorkspaceList from "@/components/WorkspaceList";
import { processTranscriptAction } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addTranscript,
  updateActionItemStatus,
  Transcript,
  removeTranscript,
} from "@/store/slices/transcriptSlice";
import { v4 as uuidv4 } from "uuid";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Save,
  Edit,
} from "lucide-react";
import { TranscriptEditor } from "@/components/TranscriptEditor";
import { Navbar } from "@/components/layout/Navbar";
import { UserProfile } from "@/components/layout/UserProfile";
import { AuthModal } from "@/components/modals/AuthModal";
import { TranscriptList } from "@/components/transcript/TranscriptList";
import {
  CREATE_WORKSPACE,
  CREATE_TRANSCRIPT,
  CREATE_ACTION_ITEM,
  UPDATE_ACTION_ITEM,
  DELETE_TRANSCRIPT,
} from "@/lib/graphql/mutations";
import { GET_TRANSCRIPTS } from "@/lib/graphql/queries";

export default function Home() {
  const dispatch = useAppDispatch();
  const transcripts = useAppSelector((state) => state.transcript.transcripts);
  const { data: session, status: sessionStatus } = useSession();

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    null,
  );
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<
    string | null
  >(null);
  const [currentContent, setCurrentContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // GraphQL
  const [createWorkspace] = useMutation<{
    createWorkspace: { id: string; name: string };
  }>(CREATE_WORKSPACE);
  const [createTranscript] = useMutation<{ createTranscript: { id: string } }>(
    CREATE_TRANSCRIPT,
  );
  const [createActionItem] = useMutation<{ createActionItem: { id: string } }>(
    CREATE_ACTION_ITEM,
  );
  const [updateActionItem] = useMutation<{
    updateActionItem: { id: string; status: string };
  }>(UPDATE_ACTION_ITEM);
  const [deleteTranscript] = useMutation<{ deleteTranscript: boolean }>(
    DELETE_TRANSCRIPT,
  );

  const { data: workspaceTranscriptsData, refetch: refetchTranscripts } =
    useQuery<{ transcripts: Transcript[] }>(GET_TRANSCRIPTS, {
      variables: { workspaceId: selectedWorkspaceId },
      skip: !selectedWorkspaceId,
      fetchPolicy: "network-only",
    });

  const [activeTranscript, setActiveTranscript] = useState<Transcript | null>(
    null,
  );

  useEffect(() => {
    if (selectedWorkspaceId) {
      if (workspaceTranscriptsData?.transcripts) {
        if (selectedTranscriptId) {
          const found = workspaceTranscriptsData.transcripts.find(
            (t: Transcript) => t.id === selectedTranscriptId,
          );

          setActiveTranscript(found || null);
          if (found) setCurrentContent(found.content);
        } else if (workspaceTranscriptsData.transcripts.length > 0) {
          const first = workspaceTranscriptsData.transcripts[0];
          setSelectedTranscriptId(first.id);
          setActiveTranscript(first);
          setCurrentContent(first.content);
        } else {
          setActiveTranscript(null);
          setCurrentContent("");
        }
      }
    } else {
      if (selectedTranscriptId) {
        const found = transcripts.find((t) => t.id === selectedTranscriptId);
        setActiveTranscript(found || null);
        if (found) setCurrentContent(found.content);
      } else if (transcripts.length > 0) {
        const first = transcripts[0];
        setSelectedTranscriptId(first.id);
        setActiveTranscript(first);
        setCurrentContent(first.content);
      } else {
        setActiveTranscript(null);
        setCurrentContent("");
      }
    }
  }, [
    selectedWorkspaceId,
    selectedTranscriptId,
    workspaceTranscriptsData,
    transcripts,
  ]);

  const handleProcess = async (textOverride?: string) => {
    const textToProcess = textOverride || currentContent;
    if (!textToProcess.trim()) return;

    setIsProcessing(true);
    try {
      const actionItems = await processTranscriptAction(textToProcess);

      if (selectedWorkspaceId) {

        const { data: trData } = await createTranscript({
          variables: {
            input: { workspaceId: selectedWorkspaceId, content: textToProcess },
          },
        });

        if (trData?.createTranscript) {
          const trId = trData.createTranscript.id;


          for (const item of actionItems) {
            await createActionItem({
              variables: {
                input: {
                  transcriptId: trId,
                  task: item.task,
                  owner: item.owner || null,
                  dueDate: item.dueDate || null,
                  status: "OPEN",
                },
              },
            });
          }

          await refetchTranscripts();
          setSelectedTranscriptId(trId);
        }
      } else {
        const newId = uuidv4();
        const newTranscript = {
          id: newId,
          content: textToProcess,
          createdAt: new Date().toISOString(),
          actionItems: actionItems,
        };

        dispatch(addTranscript(newTranscript));
        setSelectedTranscriptId(newId);
      }
    } catch (error) {
      console.error("Failed to process:", error);
      alert("Failed to process transcript. See console.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToWorkspace = async () => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    if (!currentContent.trim()) return;

    setIsSaving(true);
    try {
      let wsId = selectedWorkspaceId;
      if (!wsId) {
        const { data: wsData } = await createWorkspace({
          variables: {
            input: {
              name: "My Workspace",
              userId: (session!.user as unknown as { id: string }).id,
            },
          },
        });
        if (!wsData) throw new Error("Failed to create workspace");
        wsId = wsData.createWorkspace.id;
      }

      const { data: trData } = await createTranscript({
        variables: { input: { workspaceId: wsId, content: currentContent } },
      });
      if (!trData) throw new Error("Failed to create transcript");
      const trId = trData.createTranscript.id;

      if (activeTranscript && activeTranscript.actionItems) {
        for (const item of activeTranscript.actionItems) {
          await createActionItem({
            variables: {
              input: {
                transcriptId: trId,
                task: item.task,
                owner: item.owner || null,
                dueDate: item.dueDate || null,
                status: "OPEN",
              },
            },
          });
        }
      }

      if (wsId) {
        setSelectedWorkspaceId(wsId);
        setTimeout(() => refetchTranscripts(), 200);
      }
    } catch (e) {
      console.error(e);
      alert("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleError = (msg: string) => alert(msg);

  const handleUpdateActionItem = async (
    itemId: string,
    updates: { task?: string; owner?: string; status?: "OPEN" | "DONE" },
  ) => {
    if (selectedWorkspaceId) {
      try {
        await updateActionItem({
          variables: { input: { id: itemId, ...updates } },
        });
        refetchTranscripts();
      } catch (e) {
        console.error(e);
        handleError("Failed to update item");
      }
    } else if (activeTranscript) {
      if (updates.status) {
        dispatch(
          updateActionItemStatus({
            transcriptId: activeTranscript.id,
            actionItemId: itemId,
            status: updates.status,
          }),
        );
      }
      dispatch({
        type: "transcript/editActionItem",
        payload: {
          transcriptId: activeTranscript.id,
          actionItemId: itemId,
          updates: updates,
        },
      });
    }
  };

  const handleToggleStatus = async (
    itemId: string,
    currentStatus: "OPEN" | "DONE",
  ) => {
    const newStatus = currentStatus === "OPEN" ? "DONE" : "OPEN";
    await handleUpdateActionItem(itemId, { status: newStatus });
  };

  const handleCreateWorkspace = async () => {
    const name = prompt("Workspace Name:");
    if (name && session) {
      await createWorkspace({
        variables: { input: { name, userId: (session.user as any).id } },
      });
      window.location.reload();
    }
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 flex flex-col">
      {/* Header */}
      <Navbar
        session={session}
        showProfile={showProfile}
        setShowProfile={setShowProfile}
        setShowAuthModal={setShowAuthModal}
      />

      {/* Profile Dropdown */}
      <UserProfile session={session!} showProfile={showProfile} />



      {/* Grid */}
      <div className="flex-1 w-full min-h-0 grid grid-cols-1 md:grid-cols-12 overflow-y-auto md:overflow-hidden relative">
        {/* Left: Workspaces (2 cols) */}
        <div className="hidden md:flex md:col-span-2 border-r border-red-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex-col md:h-full md:overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-6">
            <WorkspaceList
              selectedId={selectedWorkspaceId}
              onSelect={setSelectedWorkspaceId}
              onCreateNew={handleCreateWorkspace}
            />

            <TranscriptList
              transcripts={
                selectedWorkspaceId
                  ? workspaceTranscriptsData?.transcripts || []
                  : transcripts
              }
              selectedId={selectedTranscriptId}
              selectedWorkspaceId={selectedWorkspaceId}
              onSelect={(id) => {
                if (!selectedWorkspaceId) setSelectedWorkspaceId(null);
                setSelectedTranscriptId(id);
              }}
              onDelete={async (id) => {
                if (confirm("Delete transcript?")) {
                  if (selectedWorkspaceId) {
                    await deleteTranscript({ variables: { id } });
                    refetchTranscripts();
                  } else {
                    dispatch(removeTranscript(id));
                    if (selectedTranscriptId === id) {
                      setSelectedTranscriptId(null);
                      setActiveTranscript(null);
                      setCurrentContent("");
                    }
                  }
                }
              }}
              onNew={() => {
                 setSelectedTranscriptId(null);
                 setCurrentContent("");
                 setActiveTranscript(null);
              }}
            />
          </div>
        </div>

        {/* Middle: Action Flow (6 cols) */}
        <div className="col-span-12 md:col-span-6 flex flex-col bg-zinc-50 dark:bg-zinc-950 border-r border-red-200 dark:border-zinc-800 relative md:h-full md:overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-red-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
              Action Plan
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleSaveToWorkspace}
                disabled={isSaving}
                className="bg-red-500/80 hover:bg-red-600 text-white px-3 py-1.5 rounded-md shadow-sm text-xs font-medium flex items-center gap-1 disabled:opacity-50 transition-colors"
              >
                <Save className="w-3 h-3" /> Save items
              </button>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            {activeTranscript ? (
              <ActionItemFlow
                items={activeTranscript.actionItems}
                onToggleStatus={handleToggleStatus}
                onUpdateItem={(id, updates) =>
                  handleUpdateActionItem(id, updates)
                }
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-sm gap-2">
                <Edit className="w-8 h-8 opacity-20" />
                <p>Action items will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Transcript Input (4 cols) */}
        <div className="col-span-12 md:col-span-4 flex flex-col bg-white dark:bg-zinc-900 relative md:h-full md:overflow-hidden">
          <TranscriptEditor
            initialContent={currentContent}
            isProcessing={isProcessing}
            onProcess={handleProcess}
            onUpdateContent={setCurrentContent}
            readOnly={false}
          />
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </main>
  );
}
