# Meeting Action Item Tracker

A robust application for tracking meeting action items, processing transcripts with AI, and managing workspaces.

## System Components

## System Architecture

## Data Flow

## User Flow

## Usage

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
