# Onno: The Blueprint (PRD & Technical Specification)
## Real-time Decision Intelligence & Workflow Agent

**Version:** 1.0.0
**Date:** 2025-12-01
**Author:** Onno Product Team
**Status:** Approved for Development

---

## 1. Introduction

### 1.1 Product Vision
**Onno** is a vertical AI agent designed to augment the cognitive capabilities of investment professionals (VC, PE, AC) during high-stakes meetings. It shifts the paradigm from **passive recording** to **active navigation**, providing real-time intelligence and seamless workflow automation.

### 1.2 Target User Persona
*   **Primary:** VC Investment Associate (3-5 years exp.)
*   **Behavior:** Conducts 5+ meetings/day, switches contexts frequently, uses Notion/Salesforce heavily.
*   **Pain Points:** Cognitive overload, missed critical questions, manual data entry fatigue.

---

## 2. User Experience (UX) Architecture

### 2.1 Dual Interface Strategy
The application consists of two distinct but synchronized components:

1.  **The Command Center (Main Dashboard):**
    *   **Platform:** Web / Desktop App (Electron wrapper)
    *   **Purpose:** Pre-meeting prep, post-meeting review, deal management, settings.
    *   **Key View:** Dashboard, Deal Pipeline, Meeting Archive, Analytics.

2.  **The Floating Companion (HUD):**
    *   **Platform:** Desktop Overlay (Electron transparent window)
    *   **Purpose:** In-meeting real-time assistance.
    *   **Key View:** Ghost Mode (Orb), Active Mode (Cards).

---

## 3. Functional Specifications

### 3.1 Feature Set: The Command Center

#### F-01: Dashboard (Home)
*   **Today's Briefing Widget:**
    *   Display scheduled meetings from connected calendar (Google/Outlook).
    *   Action: `Prepare` button triggers a summary of previous interactions.
*   **Urgent Alerts Widget:**
    *   Display AI-detected risks or deadlines (e.g., "Deal A: Competitor news detected").
*   **Quick Actions:**
    *   `New Deal`, `Start Instant Meeting`.

#### F-02: Deal Pipeline Management
*   **Kanban View:**
    *   Columns: Sourcing, Screening, IR, Due Diligence, IC, Investment.
    *   Cards: Deal Name, Onno Score (AI rating), Last Activity.
*   **Deal Detail View (Slide-over):**
    *   Meeting history, attached documents, AI-generated deal memo draft.

#### F-03: Post-Meeting Summary & Sync
*   **Summary Panel:**
    *   Triggered automatically after meeting ends.
    *   **Structured Data Form:** Fields (Company, CEO, Revenue, Stage) pre-filled by NER (Named Entity Recognition).
    *   **Action Items:** List of detected tasks with `Add to Calendar` or `Sync to Jira` buttons.
*   **Integration Sync:**
    *   One-click push to Notion Database or Salesforce Object.

---

### 3.2 Feature Set: The Floating Companion (HUD)

#### F-04: Real-time Transcription & Analysis
*   **Streaming STT:**
    *   Capture system audio (speaker) and microphone (user).
    *   Display real-time subtitles (optional) with keyword highlighting.
*   **Context Awareness:**
    *   Detect current conversation phase (e.g., "Introduction" -> "Market Sizing" -> "Q&A").

#### F-05: Insight Cards (The "Cards" System)
*   **Question Card:**
    *   Trigger: Ambiguous statement or missing critical info.
    *   Content: Suggested question (e.g., "Ask about CAC payback period").
    *   Interaction: Click to mark as 'Asked'.
*   **Risk Card:**
    *   Trigger: Contradiction or red flag detection.
    *   Content: Warning message (e.g., "Revenue figure mismatches deck").
*   **Fact Card:**
    *   Trigger: Technical term or competitor mention.
    *   Content: Definition or brief profile.

#### F-06: Quick Tools
*   **Bookmark:** Timestamp current moment.
*   **To-Do:** Convert last utterance to task.

---

## 4. Technical Architecture

### 4.1 Tech Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14 (App Router)** | React Server Components for performance, SEO (for web marketing). |
| **Desktop Wrapper** | **Electron** | Essential for "Always on Top" floating window and system audio capture. |
| **Styling** | **Tailwind CSS** | Rapid UI development, consistent design system. |
| **UI Library** | **Shadcn/UI + Framer Motion** | High-quality components, smooth animations for HUD. |
| **State Management** | **Zustand** | Lightweight, easy to manage cross-window state (Main <-> HUD). |
| **Database** | **Supabase (PostgreSQL)** | Relational data (Deals, Users) + Vector support (pgvector). |
| **Real-time Sync** | **Supabase Realtime** | Sync state between HUD and Dashboard. |

### 4.2 AI Pipeline (The Brain)

1.  **Input Layer:**
    *   Audio Capture: `Electron Desktop Capturer` + `Web Audio API`.
    *   STT: `Deepgram Nova-2` (WebSocket streaming) for <300ms latency.

2.  **Processing Layer (Orchestrator):**
    *   **NER & Intent Classification:** Fine-tuned small model (e.g., `HuggingFace Token Classification`) for speed.
    *   **Reasoning Engine:** `GPT-4o` (via OpenAI API) for complex insight generation and question suggestion.
    *   **RAG:** Retrieve domain knowledge from `Pinecone` (Vector DB).

3.  **Output Layer:**
    *   JSON stream to Frontend (HUD) for rendering Cards.

### 4.3 Data Schema (Simplified)

```typescript
// Deal
type Deal = {
  id: string;
  name: string;
  stage: 'Sourcing' | 'Screening' | 'IR' | 'DD' | 'Investment';
  score: number; // 0-100
  metadata: Json; // Revenue, CEO, etc.
};

// Meeting
type Meeting = {
  id: string;
  dealId: string;
  transcript: TranscriptSegment[];
  summary: string;
  actionItems: Task[];
  insights: Insight[];
  startedAt: Date;
  endedAt: Date;
};

// Insight
type Insight = {
  id: string;
  type: 'Question' | 'Risk' | 'Fact';
  content: string;
  context: string; // The transcript segment that triggered this
  status: 'Pending' | 'Used' | 'Dismissed';
};
```

---

## 5. Development Roadmap (MVP Scope)

### Phase 1: Foundation (Weeks 1-2)
*   [ ] Setup Next.js + Electron boilerplate.
*   [ ] Implement basic Dashboard UI (Layout, Sidebar).
*   [ ] Implement Floating Window (Transparent, Click-through).

### Phase 2: The Ear (Weeks 3-4)
*   [ ] Integrate Deepgram for real-time STT.
*   [ ] Implement Audio Capture (System + Mic).
*   [ ] Display live transcript in HUD.

### Phase 3: The Brain (Weeks 5-6)
*   [ ] Connect OpenAI API.
*   [ ] Implement basic "Question Recommendation" logic (Prompt Engineering).
*   [ ] Render Insight Cards in HUD.

### Phase 4: The Bridge (Weeks 7-8)
*   [ ] Implement Post-meeting Summary View.
*   [ ] Build "Deal Pipeline" basic CRUD.
*   [ ] Polish UI/UX (Animations, Dark Mode).

---

## 6. Security & Compliance
*   **Data Encryption:** AES-256 for stored data, TLS 1.3 for transit.
*   **PII Masking:** Auto-masking of sensitive info (SSN, Credit Card) in transcripts.
*   **Local-First Option:** (Future) Explore local LLM (Llama 3) for on-device processing.
