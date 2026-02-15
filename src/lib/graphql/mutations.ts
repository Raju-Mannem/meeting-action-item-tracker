import { gql } from "@apollo/client";

export const CREATE_WORKSPACE = gql`
  mutation CreateWorkspace($input: CreateWorkspaceInput!) {
    createWorkspace(input: $input) {
      id
      name
    }
  }
`;

export const CREATE_TRANSCRIPT = gql`
  mutation CreateTranscript($input: CreateTranscriptInput!) {
    createTranscript(input: $input) {
      id
    }
  }
`;

export const CREATE_ACTION_ITEM = gql`
  mutation CreateActionItem($input: CreateActionItemInput!) {
    createActionItem(input: $input) {
      id
    }
  }
`;

export const UPDATE_ACTION_ITEM = gql`
  mutation UpdateActionItem($input: UpdateActionItemInput!) {
    updateActionItem(input: $input) {
      id
      status
    }
  }
`;

export const DELETE_TRANSCRIPT = gql`
  mutation DeleteTranscript($id: ID!) {
    deleteTranscript(id: $id)
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      userName
    }
  }
`;