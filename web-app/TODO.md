# Onno MVP Development Roadmap

This document outlines the step-by-step plan to build the MVP of **Onno**, a Real-time Decision Intelligence & Workflow Agent.

## Phase 1: Project Initialization & Infrastructure
- [ ] **Project Setup**
    - [ ] Initialize Next.js project (App Router, TypeScript).
    - [ ] Install Electron for desktop wrapper capabilities.
    - [ ] Configure Tailwind CSS and Shadcn/UI.
    - [ ] Set up project folder structure (`/src/app`, `/src/components`, `/electron`, etc.).
- [ ] **Database & Backend (Supabase)**
    - [ ] Create Supabase project.
    - [ ] Define Database Schema (Users, Deals, Meetings, Insights).
    - [ ] Setup Authentication (Email/Password, OAuth).
    - [ ] Generate TypeScript types from Supabase schema.
- [ ] **Version Control**
    - [ ] Initialize Git repository.
    - [ ] Create `.gitignore` (including `.env`, `node_modules`, `dist`).
    - [ ] Initial commit.

## Phase 2: The Command Center (Main Dashboard)
- [ ] **Layout & Navigation**
    - [ ] Implement Sidebar (Dashboard, Pipeline, Meetings, etc.).
    - [ ] Create Main Layout wrapper.
    - [ ] Implement Dark Mode toggle (default Dark).
- [ ] **Dashboard Widgets**
    - [ ] "Today's Briefing" widget (Mock data first, then real).
    - [ ] "Urgent Alerts" widget.
- [ ] **Deal Pipeline**
    - [ ] Implement Kanban Board using `dnd-kit` or similar.
    - [ ] Create Deal Card component.
    - [ ] Implement Deal Detail Slide-over.

## Phase 3: The Floating Companion (HUD)
- [ ] **Electron Window Management**
    - [ ] Configure transparent, always-on-top window.
    - [ ] Implement "Ghost Mode" (Orb) vs "Active Mode" (Card) toggles.
    - [ ] Handle window resizing and dragging.
- [ ] **HUD UI Components**
    - [ ] Live Transcript View (Streaming text UI).
    - [ ] Insight Card Components (Question, Risk, Fact).
    - [ ] Quick Action Toolbar.

## Phase 4: The Ear (Audio & Transcription)
- [ ] **Audio Capture**
    - [ ] Implement System Audio capture (Electron `desktopCapturer`).
    - [ ] Implement Microphone capture.
- [ ] **STT Integration**
    - [ ] Integrate Deepgram Nova-2 (WebSocket).
    - [ ] Handle real-time streaming and display in HUD.

## Phase 5: The Brain (AI & Logic)
- [ ] **AI Orchestration**
    - [ ] Setup OpenAI API (GPT-4o).
    - [ ] Implement Prompt Engineering for "Question Recommendation".
    - [ ] Implement "Risk Detection" logic.
- [ ] **Context Engine**
    - [ ] Basic RAG setup (Pinecone) for domain terms (optional for MVP, can be hardcoded first).

## Phase 6: The Bridge (Workflow & Sync)
- [ ] **Post-Meeting Summary**
    - [ ] Create Summary Panel UI.
    - [ ] Implement "Auto-fill" logic for Deal Data.
- [ ] **Integrations (Mock/Basic)**
    - [ ] "Sync to Notion" (Mock function or basic API call).
    - [ ] "Draft Email" (`mailto:` link generation).

## Phase 7: Polish & Launch
- [ ] **Testing**
    - [ ] Manual end-to-end testing (Meeting flow).
    - [ ] Performance tuning (Electron memory usage).
- [ ] **Deployment**
    - [ ] Build Electron app for Windows.
    - [ ] Local hosting/testing instructions.
