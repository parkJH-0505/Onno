# Onno - Real-time Decision Intelligence

> AI-powered meeting companion for investment professionals

## 🎯 What is Onno?

**Onno** is a vertical AI agent that provides **real-time decision intelligence** during high-stakes business meetings (VC pitches, due diligence, mentoring sessions). Unlike passive recording tools, Onno actively **navigates** your conversations by:

- 💡 **Suggesting critical questions** to ask in real-time
- ⚠️ **Detecting risks** and contradictions
- ℹ️ **Explaining technical terms** on the fly
- 🔗 **Syncing insights** to your CRM/workflow tools

## ✨ Features

### ✅ Implemented (MVP v1.0)

#### 1. **Command Center (Main Dashboard)**
- Today's meeting briefings
- Deal pipeline visualization
- Quick stats and analytics
- Navigation sidebar

#### 2. **Floating HUD (Always-On-Top Companion)**
- **Ghost Mode**: Minimized orb that doesn't interrupt
- **Active Mode**: Real-time insight cards
- Live transcript preview
- One-click copy/dismiss actions

#### 3. **AI Engine**
- GPT-4o powered conversation analysis
- Automatic insight generation (Questions, Risks, Facts)
- Meeting summary generation
- Deal data extraction for CRM sync

#### 4. **Database (Supabase)**
- Complete schema for deals, meetings, insights
- Row-level security (RLS)
- Real-time data sync

### 🚧 Roadmap

- [ ] Real system audio capture (Electron desktopCapturer)
- [ ] Deepgram STT integration
- [ ] User authentication
- [ ] CRM integrations (Notion, Salesforce)
- [ ] Custom question templates
- [ ] Team collaboration features

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- (Optional) OpenAI API key
- (Optional) Supabase account

### Installation

```bash
# Clone or navigate to the project
cd web-app

# Install dependencies
npm install

# Set up environment variables
cp ENV_SETUP.md .env.local
# Edit .env.local with your API keys

# Run the app
npm run electron
```

This will open:
1. **Main Window**: Dashboard
2. **Floating Window**: HUD (top-left corner)

### Testing AI Features

1. Click the floating orb to expand HUD
2. Click "Start Recording"
3. Watch as simulated conversation generates real-time insights
4. (With OpenAI API key) Get actual AI-powered analysis

## 📁 Project Structure

```
web-app/
├── electron/              # Electron main process
│   ├── main.js           # Window management + IPC
│   └── preload.js        # Secure API bridge
├── src/
│   ├── app/
│   │   ├── page.tsx      # Dashboard
│   │   ├── hud/
│   │   │   └── page.tsx  # Floating HUD
│   │   └── api/
│   │       └── analyze/  # AI analysis endpoint
│   ├── lib/
│   │   ├── ai.ts         # OpenAI integration
│   │   ├── supabase.ts   # Database client
│   │   └── utils.ts      # Helpers
│   └── types/
│       └── electron.d.ts # TypeScript definitions
├── supabase/
│   └── schema.sql        # Database schema
└── package.json
```

## 🔧 Configuration

### 1. OpenAI Setup (Required for AI)

```env
OPENAI_API_KEY=sk-...
```

Get your key at: https://platform.openai.com/api-keys

### 2. Supabase Setup (Required for persistence)

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3. Deepgram (Optional - for real STT)

```env
DEEPGRAM_API_KEY=...
```

## 📝 Scripts

```bash
# Development
npm run dev          # Next.js web only
npm run electron     # Full app (Dashboard + HUD)

# Build
npm run build        # Build Next.js
npm run electron:build  # Package Electron app
```

## 🎨 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19
- **Desktop**: Electron
- **Styling**: Tailwind CSS (Dark Mode)
- **AI**: OpenAI GPT-4o
- **Database**: Supabase (PostgreSQL)
- **STT**: Deepgram (planned)

## 📚 Documentation

- [Problem Definition & Personas](../Onno_Problem_Definition_and_Personas.md)
- [Product Requirements (PRD)](../Onno_Product_Requirement_Document.md)
- [Technical Blueprint](../Onno_The_Blueprint.md)
- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Environment Variables](./ENV_SETUP.md)

## 🎯 Use Cases

### For VC/PE Investors
- Verify founder claims in real-time
- Never miss critical due diligence questions
- Auto-sync deal data to your CRM

### For Accelerators
- Standardize mentoring quality across teams
- Track startup progress over multiple sessions
- Generate consistent feedback reports

### For Company Builders
- Reduce hiring mistakes with better interview questions
- Detect groupthink in internal strategy meetings
- Build organizational knowledge base

## 🤝 Contributing

This is currently a private MVP. For questions or collaboration:
- Open an issue
- Contact: [your-email]

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ for investment professionals who believe conversations are too important to leave to memory alone.**
