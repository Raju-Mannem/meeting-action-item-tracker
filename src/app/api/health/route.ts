import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const healthStatus = {
        backend: 'healthy',
        database: 'unknown',
        llm: 'unknown',
    };

    try {
        await prisma.$queryRaw`SELECT 1`;
        healthStatus.database = 'healthy';
    } catch (error) {
        healthStatus.database = 'unhealthy';
        console.error('Database health check failed:', error);
    }

    if (process.env.GROQ_API_KEY) {
        healthStatus.llm = 'ready';
    } else {
        healthStatus.llm = 'not_configured';
    }

    return NextResponse.json(healthStatus);
}
