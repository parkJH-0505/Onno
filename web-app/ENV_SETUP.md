# Onno Environment Variables Configuration Guide

## Required API Keys

### OpenAI (Required for AI insights)
OPENAI_API_KEY=sk-...

### Supabase (Required for database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

### Deepgram (Optional - for real STT)
DEEPGRAM_API_KEY=...

## Setup Instructions

1. Copy this file to `.env.local`
2. Fill in your API keys
3. Restart the development server

## Getting API Keys

### OpenAI
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy and paste above

### Supabase
1. Create project at https://supabase.com
2. Go to Project Settings > API
3. Copy URL and anon/public key

### Deepgram (Optional)
1. Sign up at https://deepgram.com
2. Create API key in console
3. Copy and paste above
