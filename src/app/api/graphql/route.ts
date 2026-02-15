import apolloServer from '@/lib/apollo-server'

export async function GET(req: Request) {
    return apolloServer(req);
}

export async function POST(request: Request) {
    return apolloServer(request);
}