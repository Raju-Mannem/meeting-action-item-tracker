import { gql } from "@apollo/client";

export const GET_TRANSCRIPTS = gql`
  query GetTranscripts($workspaceId: ID!) {
    transcripts(workspaceId: $workspaceId) {
      id
      content
      createdAt
      actionItems {
        id
        task
        owner
        dueDate
        status
      }
    }
  }
`;

export const GET_WORKSPACES = gql`
  query GetWorkspaces($userId: ID!) {
    workspaces(userId: $userId) {
      id
      name
      createdAt
    }
  }
`;

export const DELETE_WORKSPACE = gql`
  mutation DeleteWorkspace($id: ID!) {
    deleteWorkspace(id: $id)
  }
`;

export const UPDATE_WORKSPACE = gql`
  mutation UpdateWorkspace($input: UpdateWorkspaceInput!) {
    updateWorkspace(input: $input) {
      id
      name
    }
  }
`;
