import { GraphQLError } from "graphql";
import { PrismaClient, Prisma, Status } from "@/generated/prisma/client";

type Context = { prisma: PrismaClient };

const resolvers = {
  Query: {
    healthCheck: async (_parent: unknown, _args: unknown, { prisma }: Context) => {
      const dbStatus = await prisma.$queryRaw`SELECT 1`
        .then(() => true)
        .catch(() => false);
      return {
        database: dbStatus,
        llm: true,
      };
    },
    users: async (_parent: unknown, _args: unknown, { prisma }: Context) => {
      return await prisma.user.findMany();
    },
    user: async (_parent: unknown, { id }: { id: string }, { prisma }: Context) => {
      return await prisma.user.findUnique({ where: { id } });
    },
    recentTranscripts: async (_parent: unknown, _args: { userId: string }, { prisma }: Context) => {
      return await prisma.transcript.findMany({
        where: { workspace: { userId: _args.userId } },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { actionItems: true },
      });
    },
    transcripts: async (_parent: unknown, { workspaceId }: { workspaceId: string }, { prisma }: Context) => {
      return await prisma.transcript.findMany({
        where: { workspaceId },
        include: { actionItems: true },
        orderBy: { createdAt: "desc" },
      });
    },
    workspaces: async (_parent: unknown, { userId }: { userId: string }, { prisma }: Context) => {
      return await prisma.workspace.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    },
  },
  Mutation: {
    createActionItem: async (
      _parent: unknown,
      { input }: { input: { transcriptId: string; task: string; owner?: string; dueDate?: string; status?: Status } },
      { prisma }: Context,
    ) => {
      return await prisma.actionItem.create({
        data: {
          transcriptId: input.transcriptId,
          task: input.task,
          owner: input.owner,
          dueDate: input.dueDate ? new Date(input.dueDate).toISOString() : undefined,
          status: input.status || Status.OPEN,
        },
      });
    },
    createWorkspace: async (
      _parent: unknown,
      { input }: { input: { name: string; userId: string } },
      { prisma }: Context,
    ) => {
      return await prisma.workspace.create({ data: input });
    },
    updateWorkspace: async (
      _parent: unknown,
      { input }: { input: { id: string; name: string } },
      { prisma }: Context,
    ) => {
      return await prisma.workspace.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    },
    deleteWorkspace: async (
      _parent: unknown,
      { id }: { id: string },
      { prisma }: Context,
    ) => {
      await prisma.workspace.delete({ where: { id } });
      return true;
    },
    createUser: async (_parent: unknown, { input }: { input: { userName: string; password: string } }, { prisma }: Context) => {
      return await prisma.user.create({ data: input });
    },
    updateUser: async (
      _parent: unknown,
      { input }: { input: { id: string; userName: string; password: string } },
      { prisma }: Context,
    ) => {
      return await prisma.user.update({
        where: { id: input.id },
        data: input,
      });
    },
    deleteUser: async (
      _parent: unknown,
      { id }: { id: string },
      { prisma }: Context,
    ) => {
      await prisma.user.delete({ where: { id } });
      return true;
    },
    createTranscript: async (
      _parent: unknown,
      { input }: { input: { content: string; workspaceId: string } },
      { prisma }: Context,
    ) => {
      return await prisma.transcript.create({ data: input });
    },
    updateTranscript: async (
      _parent: unknown,
      { input }: { input: { id: string; content: string; workspaceId: string } },
      { prisma }: Context,
    ) => {
      return await prisma.transcript.update({
        where: { id: input.id },
        data: input,
      });
    },
    deleteTranscript: async (
      _parent: unknown,
      { id }: { id: string },
      { prisma }: Context,
    ) => {
      await prisma.transcript.delete({ where: { id } });
      return true;
    },
    deleteActionItem: async (
      _parent: unknown,
      { id }: { id: string },
      { prisma }: Context,
    ) => {
      try {
        await prisma.actionItem.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },
    processTranscript: async (
      _parent: unknown,
      { input }: { input: { text: string; workspaceId: string } },
      { prisma }: Context,
    ) => {
      const { text, workspaceId } = input;

      if (!text || text.trim().length < 10) {
        throw new GraphQLError("Transcript text is too short to process.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      try {
        const mockAIItems: Prisma.ActionItemCreateWithoutTranscriptInput[] = [
          {
            task: "Follow up with Marketing",
            owner: "Sarah",
            dueDate: "2026-02-20",
            status: Status.OPEN,
          },
        ];
        return await prisma.transcript.create({
          data: {
            content: text,
            workspaceId,
            actionItems: {
              create: mockAIItems,
            },
          },
          include: { actionItems: true },
        });
      } catch (error) {
        console.error("Processing Error:", error);
        throw new GraphQLError("AI Processing or Database write failed.", {
          extensions: { code: "UNPROCESSABLE_ENTITY" },
        });
      }
    },

    updateActionItem: async (
      _parent: unknown,
      { input }: { input: { id: string; status?: Status; task?: string; owner?: string; dueDate?: string } },
      { prisma }: Context,
    ) => {
      const { id, ...updateData } = input;

      try {
        return await prisma.actionItem.update({
          where: { id },
          data: updateData,
        });
      } catch {
        throw new GraphQLError("Action Item not found or update failed.", {
          extensions: { code: "NOT_FOUND" },
        });
      }
    },
  },
};

export default resolvers;
