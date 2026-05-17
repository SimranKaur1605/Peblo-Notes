# Peblo Notes — AI-Powered Notes Workspace

A full-stack collaborative notes application built for the Peblo Full Stack Developer Challenge. Users can create and manage notes, organize them with tags, generate AI-powered summaries, share notes publicly, and view productivity insights on a dashboard.

---

## Tech Stack

| Layer    | Choice                                |
| -------- | ------------------------------------- |
| Frontend | Next.js 15 (App Router), Tailwind CSS |
| Backend  | Next.js API Routes                    |
| Database | PostgreSQL + Prisma ORM               |
| Auth     | NextAuth.js (credentials)             |
| AI       | Groq API (LLaMA 3.3 70B)              |

---

## Features

- **Authentication** — Signup, login, protected routes, persistent sessions
- **Notes Workspace** — Create, edit, auto-save (2s debounce), archive notes
- **Tags** — Add/remove tags, filter notes by tag
- **AI Integration** — Generate summary, action items, suggested title via Groq LLM
- **Search & Filter** — Keyword search + tag filter + sort by recently updated
- **Public Sharing** — Generate shareable public link, accessible without login
- **Dashboard Insights** — Total notes, AI usage count, weekly activity chart, top tags, recent notes

---

## Setup Instructions

### 1. Clone the repo

\`\`\`bash
git clone https://github.com/yourusername/peblo-notes.git
cd peblo-notes
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Configure environment variables

\`\`\`bash
cp .env.example .env
\`\`\`

Fill in your `.env`:

\`\`\`env
DATABASE_URL=postgresql://user:password@localhost:5432/peblo_notes
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key_here
\`\`\`

> Get a free Groq API key at https://console.groq.com

### 4. Setup database

\`\`\`bash
npx prisma migrate dev --name init
npx prisma generate
\`\`\`

### 5. Run the app

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

---

## Architecture

\`\`\`
peblo-notes/
├── app/
│ ├── api/
│ │ ├── auth/ # NextAuth handlers
│ │ ├── notes/ # CRUD + generate-summary + share
│ │ └── insights/ # Dashboard stats
│ ├── dashboard/ # Productivity insights page
│ ├── notes/ # Notes list + editor
│ ├── shared/[shareId]/ # Public share page
│ ├── login/ # Auth pages
│ └── signup/
├── components/
│ └── Navbar.tsx
├── lib/
│ ├── prisma.ts # Prisma client
│ └── auth.ts
├── prisma/
│ └── schema.prisma # DB schema
└── .env.example
\`\`\`

### API Endpoints

| Method | Endpoint                          | Description                                 |
| ------ | --------------------------------- | ------------------------------------------- |
| POST   | `/api/auth/signup`                | Register new user                           |
| POST   | `/api/auth/login`                 | Login                                       |
| GET    | `/api/notes`                      | Get all notes (search, filter, sort)        |
| POST   | `/api/notes`                      | Create new note                             |
| PATCH  | `/api/notes/:id`                  | Update note (title, content, tags, archive) |
| DELETE | `/api/notes/:id`                  | Delete note                                 |
| POST   | `/api/notes/:id/generate-summary` | Generate AI summary                         |
| POST   | `/api/notes/:id/share`            | Generate public share link                  |
| DELETE | `/api/notes/:id/share`            | Remove share link                           |
| GET    | `/api/shared/:shareId`            | Get public note                             |
| GET    | `/api/insights`                   | Get dashboard stats                         |

### AI Integration

Uses **Groq API** with `llama-3.3-70b-versatile` model. On clicking "AI Summary Banao":

1. Note content sent to `/api/notes/:id/generate-summary`
2. Groq LLM generates summary, action items, suggested title, and optional Mermaid diagram
3. Summary saved to DB and returned to frontend
4. AI usage count incremented for dashboard stats

---

## Sample API Responses

### GET /api/notes

\`\`\`json
[
{
"id": "cmp88znvy00064tmd40mzlnf7",
"title": "Electronics Notes",
"content": "What is a semiconductor...",
"summary": "A comprehensive note covering...",
"tags": [{ "tag": { "name": "physics" } }],
"isPublic": false,
"updatedAt": "2026-05-16T17:24:00Z"
}
]
\`\`\`

### POST /api/notes/:id/generate-summary

\`\`\`json
{
"summary": "This note covers semiconductor basics including diodes, transistors, and op-amps...",
"actionItems": ["Study PN junction working", "Practice rectifier circuits"],
"suggested_title": "Electronics & Semiconductor Notes",
"mermaid_diagram": "flowchart TD\n A[Input] --> B[Diode]\n B --> C[Output]",
"diagram_title": "Diode Circuit Flow"
}
\`\`\`

### GET /api/insights

\`\`\`json
{
"totalNotes": 12,
"aiUsageCount": 8,
"archivedNotes": 2,
"topTags": [
{ "name": "physics", "count": 5 },
{ "name": "math", "count": 3 }
],
"recentNotes": [...],
"dailyActivity": [
{ "day": "Mon", "date": "2026-05-11", "count": 3 },
{ "day": "Tue", "date": "2026-05-12", "count": 1 }
]
}
\`\`\`

---

## Database Schema

Key models in `prisma/schema.prisma`:

\`\`\`prisma
model User {
id String @id @default(cuid())
name String
email String @unique
password String
notes Note[]
}

model Note {
id String @id @default(cuid())
title String
content String
summary String?
actionItems String[]
isPublic Boolean @default(false)
isArchived Boolean @default(false)
shareId String? @unique
userId String
user User @relation(fields: [userId], references: [id])
tags NoteTag[]
updatedAt DateTime @updatedAt
createdAt DateTime @default(now())
}

model Tag {
id String @id @default(cuid())
name String @unique
notes NoteTag[]
}

model NoteTag {
noteId String
tagId String
note Note @relation(fields: [noteId], references: [id])
tag Tag @relation(fields: [tagId], references: [id])
@@id([noteId, tagId])
}
\`\`\`

---

## Demo Video

[Link to demo video] — covers authentication, notes workflow, AI summary, search/filter, public sharing, and dashboard.
