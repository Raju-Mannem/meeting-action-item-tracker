import { GraphQLError } from "graphql";
import { Prisma, Status } from "@/generated/prisma/client";

const resolvers = {
  Query: {
    healthCheck: async (_parent: any, _args: any, { prisma }: any) => {
      const dbStatus = await prisma.$queryRaw`SELECT 1`
        .then(() => true)
        .catch(() => false);
      return {
        database: dbStatus,
        llm: true,
      };
    },
    users: async (_parent: any, _args: any, { prisma }: any) => {
      return await prisma.user.findMany();
    },
    user: async (_parent: any, { id }: { id: string }, { prisma }: any) => {
      return await prisma.user.findUnique({ where: { id } });
    },
    recentTranscripts: async (_parent: any, _args: { userId: string }, { prisma }: any) => {
      return await prisma.transcript.findMany({
        where: { workspace: { userId: _args.userId } },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { actionItems: true },
      });
    },
    transcripts: async (_parent: any, { workspaceId }: { workspaceId: string }, { prisma }: any) => {
      return await prisma.transcript.findMany({
        where: { workspaceId },
        include: { actionItems: true },
        orderBy: { createdAt: "desc" },
      });
    },
    workspaces: async (_parent: any, { userId }: { userId: string }, { prisma }: any) => {
      return await prisma.workspace.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    },
  },
  Mutation: {
    createActionItem: async (
      _parent: any,
      { input }: { input: { transcriptId: string; task: string; owner?: string; dueDate?: string; status?: Status } },
      { prisma }: any,
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
      _parent: any,
      { input }: { input: { name: string; userId: string } },
      { prisma }: any,
    ) => {
      return await prisma.workspace.create({ data: input });
    },
    updateWorkspace: async (
      _parent: any,
      { input }: { input: { id: string; name: string } },
      { prisma }: any,
    ) => {
      return await prisma.workspace.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    },
    deleteWorkspace: async (
      _parent: any,
      { id }: { id: string },
      { prisma }: any,
    ) => {
      await prisma.workspace.delete({ where: { id } });
      return true;
    },
    createUser: async (_parent: any, { input }: { input: { userName: string; password: string } }, { prisma }: any) => {
      return await prisma.user.create({ data: input });
    },
    updateUser: async (
      _parent: any,
      { input }: { input: { id: string; userName: string; password: string } },
      { prisma }: any,
    ) => {
      return await prisma.user.update({
        where: { id: input.id },
        data: input,
      });
    },
    deleteUser: async (
      _parent: any,
      { id }: { id: string },
      { prisma }: any,
    ) => {
      await prisma.user.delete({ where: { id } });
      return true;
    },
    createTranscript: async (
      _parent: any,
      { input }: { input: { content: string; workspaceId: string } },
      { prisma }: any,
    ) => {
      return await prisma.transcript.create({ data: input });
    },
    updateTranscript: async (
      _parent: any,
      { input }: { input: { id: string; content: string; workspaceId: string } },
      { prisma }: any,
    ) => {
      return await prisma.transcript.update({
        where: { id: input.id },
        data: input,
      });
    },
    deleteTranscript: async (
      _parent: any,
      { id }: { id: string },
      { prisma }: any,
    ) => {
      await prisma.transcript.delete({ where: { id } });
      return true;
    },
    deleteActionItem: async (
      _parent: any,
      { id }: { id: string },
      { prisma }: any,
    ) => {
      try {
        await prisma.actionItem.delete({ where: { id } });
        return true;
      } catch (error) {
        return false;
      }
    },
    processTranscript: async (
      _parent: any,
      { input }: { input: { text: string; workspaceId: string } },
      { prisma }: any,
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
      _parent: any,
      { input }: { input: { id: string; status?: Status; task?: string; owner?: string; dueDate?: string } },
      { prisma }: any,
    ) => {
      const { id, ...updateData } = input;

      try {
        return await prisma.actionItem.update({
          where: { id },
          data: updateData,
        });
      } catch (error) {
        throw new GraphQLError("Action Item not found or update failed.", {
          extensions: { code: "NOT_FOUND" },
        });
      }
    },
  },
};

export default resolvers;
