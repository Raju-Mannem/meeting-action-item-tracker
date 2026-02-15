const typeDefs = `#graphql
enum Status {
  OPEN
  DONE
}

type HealthStatus {
  database: Boolean!
  llm: Boolean!
}

type User {
  id: ID!
  userName: String!
  password: String!
  transcripts: [Transcript!]
}

type ActionItem {
  id: ID!
  task: String!
  owner: String
  dueDate: String
  status: Status!
  transcriptId: ID!
}

type Transcript {
  id: ID!
  content: String!
  createdAt: String!
  actionItems: [ActionItem!]
  user: User!
}

input CreateUserInput {
  userName: String!
  password: String!
}

input UpdateUserInput {
  id: ID!
  userName: String
  password: String
}

input CreateTranscriptInput {
  content: String!
  workspaceId: ID!
}

input UpdateTranscriptInput {
  id: ID!
  content: String
  workspaceId: ID
}

input CreateActionItemInput {
  task: String!
  owner: String
  dueDate: String
  status: Status!
  transcriptId: ID!
}

input UpdateActionItemInput {
  id: ID!
  task: String
  owner: String
  dueDate: String
  status: Status
}

input ProcessTranscriptInput {
  text: String!
  workspaceId: ID!
}


type Workspace {
  id: ID!
  name: String!
  createdAt: String!
  user: User!
  transcripts: [Transcript!]
}

input CreateWorkspaceInput {
  name: String!
  userId: ID!
}

input UpdateWorkspaceInput {
  id: ID!
  name: String!
}

type Query {
  users: [User!]!
  user(id: ID!): User!
  # Get last 5 transcripts for the simple history
  recentTranscripts(userId: ID!): [Transcript!]!
  transcripts(workspaceId: ID!): [Transcript!]!
  workspaces(userId: ID!): [Workspace!]!
  transcript(id: ID!): Transcript!
  actionItem(id: ID!): ActionItem!
  actionItems: [ActionItem!]!
  healthCheck: HealthStatus!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
  createWorkspace(input: CreateWorkspaceInput!): Workspace!
  updateWorkspace(input: UpdateWorkspaceInput!): Workspace!
  deleteWorkspace(id: ID!): Boolean!
  createTranscript(input: CreateTranscriptInput!): Transcript!
  updateTranscript(input: UpdateTranscriptInput!): Transcript!
  deleteTranscript(id: ID!): Boolean!
  createActionItem(input: CreateActionItemInput!): ActionItem!
  updateActionItem(input: UpdateActionItemInput!): ActionItem!
  deleteActionItem(id: ID!): Boolean!
  processTranscript(input: ProcessTranscriptInput!): Transcript!
}
`;

export default typeDefs;
