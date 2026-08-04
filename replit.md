# Revi — AI Employee for Service Businesses

**Company:** HASIA Technologies  
**Product:** Revi  
**Stack:** Next.js 15, TypeScript, Tailwind CSS, Supabase, App Router

## Overview

Revi is a production SaaS platform for service businesses. It gives owners an AI-powered employee that handles leads, customer conversations, team training, and knowledge management.

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Sign in with email/password |
| `/signup` | Create a new account |
| `/setup` | 3-step business setup wizard (post-signup) |
| `/dashboard` | Overview stats, recent leads & conversations |
| `/leads` | Lead table with add/edit/delete + status filtering |
| `/leads/[id]` | Lead detail with inline editing |
| `/conversations` | Conversation list split-view with channel filtering |
| `/conversations/[id]` | Full message thread with send composer |
| `/training` | Training course grid with publish/unpublish |
| `/training/[id]` | Course lessons list with add/delete |
| `/knowledge` | Knowledge base with category sidebar + article editor |
| `/website` | Website settings editor with live preview |
| `/settings` | Profile, business info, services, and team tabs |

## Design System

- **Brand:** White (#FFFFFF), Charcoal (#1A1A1C range), Gold (#C9931A range)
- **Typography:** Inter (Google Fonts)
- **Components:** `src/components/ui/` — Button, Input, Select, Textarea, Badge, Avatar, EmptyState, Spinner, Modal

## Running Locally

```bash
npm run dev   # starts on port 5000
```

## Environment Variables Required

| Key | Description |
|-----|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side) |
| `SESSION_SECRET` | Session secret |

## Database Tables (Supabase — do NOT modify schema)

`profiles`, `businesses`, `business_members`, `services`, `leads`, `conversations`, `messages`, `training_courses`, `training_lessons`, `employee_training_progress`, `quiz_questions`, `quiz_attempts`, `knowledge_categories`, `knowledge_articles`, `website_settings`, `business_settings`, `files`

## User Preferences

- Never restructure the database schema — existing Supabase tables are the source of truth
- Ask before making major architectural changes
- Mobile-first responsive design throughout
- White, charcoal, and gold color scheme only
- Branding: HASIA Technologies / Revi
