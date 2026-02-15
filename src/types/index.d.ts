export type CreateWorkspaceResult = {
  createWorkspace: {
    id: string;
    name: string;
  };
};

export type CreateWorkspaceVariables = {
  name: string;
  userId: string;
};

export type CreateTranscriptResult = {
  createTranscript: {
    id: string;
  };
};

export type CreateTranscriptVariables = {
  workspaceId: string;
  content: string;
};

export type CreateActionItemResult = {
  createActionItem: {
    id: string;
  };
};

export type CreateActionItemVariables = {
  transcriptId: string;
  task: string;
  owner?: string | null;
  dueDate?: string | null;
};