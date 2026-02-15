# Meeting Action Item Tracker

An Nextjs application designed to track meeting action items, intelligently process transcripts using AI, and manage collaborative workspaces with clarity and control.

## System Components
Frontend
•	Nextjs, React
•	React flow / @xyflow/react
•	framer-motion
•	clsx
•	Lucide React
•	tailwind-merge
Backend
•	Nextjs App router
Database
•	Postgresql – Neon Tech
•	Prisma
•	Graphql
•	Apollo Graphql
LLM API Provider
•	Grok console
•	Models
o	Gemma / Llama
Stock and Assets
•	React Fluid Icons
•	Lottie files
•	Freepik
•	Canva
Deployement
•	AWS [App runner]

## System Architecture


## Flow
- Paste Transcript -> Process -> AI extracts action items -> User reviews and edits -> Action items are saved to database -> User can view and manage action items in a visual workspace
```
meeting-action-item-tracker/
├── .dockerignore
├── .gitignore
├── Dockerfile
├── README.md
├── docker-compose.yml
├── docs/
│   ├── data-flow.png
│   ├── plan.docx
│   ├── problem.docx
│   ├── system-architecture.png
│   ├── system-components.png
│   └── user-flow.png
├── eslint.config.mjs
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── prisma.config.ts
├── prisma/
│   ├── migrations/
│   │   ├── 20260214152806_init/
│   │   │   └── migration.sql
│   │   ├── 20260214203059_init_workspace/
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── schema.prisma
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/
│   │   ├── actions.ts
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/
│   │   │   │   │   └── route.ts
│   │   │   │   └── signup/
│   │   │   │       └── route.ts
│   │   │   ├── graphql/
│   │   │   │   └── route.ts
│   │   │   └── health/
│   │   │       └── route.ts
│   │   ├── auth/
│   │   │   ├── signin/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx
│   │   └── status/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ActionItemFlow.tsx
│   │   ├── TranscriptEditor.tsx
│   │   ├── WorkspaceList.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── UserProfile.tsx
│   │   ├── modals/
│   │   │   └── AuthModal.tsx
│   │   └── transcript/
│   │       └── TranscriptList.tsx
│   ├── lib/
│   │   ├── apollo-client.ts
│   │   ├── apollo-server.ts
│   │   ├── auth.ts
│   │   ├── graphql/
│   │   │   ├── mutations.ts
│   │   │   ├── queries.ts
│   │   │   ├── resolvers.ts
│   │   │   └── schema.ts
│   │   ├── llmService.ts
│   │   ├── prisma.ts
│   │   └── utils.ts
│   ├── mocks/
│   │   ├── handlers.ts
│   │   └── server.ts
│   ├── store/
│   │   ├── index.ts
│   │   └── slices/
│   │       └── transcriptSlice.ts
│   └── types/
│       └── index.d.ts
└── tsconfig.json
```
### Prerequisites

- Node.js 20+
- Docker & Docker Compose (optional)
- Groq API Key
- PostgreSQL 16+

### Installation

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd meeting-action-item-tracker
    ```

2.  **Environment Setup**
    Create a `.env` file in the root directory:

    ```env
    DATABASE_URL="postgresql://postgres:password@localhost:5432/actiontracker?schema=public"
    NEXTAUTH_SECRET="your-secret-key"
    NEXTAUTH_URL="http://localhost:3000"
    GROQ_API_KEY="your-groq-api-key"
    ```

3.  **Run with Docker Compose**

    ```bash
    docker-compose up -d --build
    ```

    The app will be available at `http://localhost:3000`.

4.  **Local Development (without Docker)**
    - Start Postgres locally.
    - Update `DATABASE_URL` to point to your local DB.
    - Run migrations: `npx prisma migrate dev`
    - Install dependencies: `npm install`
    - Start dev server: `npm run dev`

## Troubleshooting

### Database Connection Issues

- **Error**: `Can't reach database server at localhost:5432`
- **Fix**: If running the app in Docker, ensure `DATABASE_URL` uses the service name `db` instead of `localhost` (e.g., `postgresql://user:pass@db:5432/...`). The `docker-compose.yml` is pre-configured for this.

### Build Failures

- **Error**: `Prisma Client not found`
- **Fix**: Run `npx prisma generate` before building. The Dockerfile handles this automatically.

### AI Processing Errors

- **Error**: `Failed to process transcript`
- **Fix**: Verify your `GROQ_API_KEY` is correct and has credits.
