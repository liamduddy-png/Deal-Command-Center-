# Trunk Tools Deal Command Center

AI-powered pipeline management tool for the Trunk Tools sales team.

## How it works

1. Paste a HubSpot deal URL into the app (or select from pipeline)
2. App extracts deal ID
3. Calls HubSpot (read-only):
   - Deal properties (dealname, amount, stage, close date)
   - MEDDPICC fields + custom milestone properties
   - Associated contacts
   - Last 5 engagements (Gong summaries, emails, calls)
4. Builds structured deal context
5. Click any Smart Action — Claude automatically receives all context

No pasting. No switching tabs. Just click and go.

## Deploy to Vercel

1. Push to GitHub
2. Import at [vercel.com](https://vercel.com)
3. Add environment variables:
   - `HUBSPOT_PRIVATE_APP_TOKEN` = your HubSpot private app token
   - `ANTHROPIC_API_KEY` = your Anthropic API key
   - `ANTHROPIC_MODEL` = claude-3-5-sonnet-20241022 (optional)
4. Set up Vercel KV (for property mapping persistence)
5. Deploy

## Run locally

```bash
npm install
npm run dev
```

Create a `.env` file:
```
HUBSPOT_PRIVATE_APP_TOKEN=your_token_here
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

## Structure

```
/api
  generate.js      — Claude AI generation (POST {type, context})
  deal.js          — Fetch deal by ID or company name
  search.js        — Search HubSpot deals
  properties.js    — List HubSpot deal properties
  mapping.js       — Save/load property mapping (Vercel KV)
  hubspot.js       — Bulk deal fetch
/lib
  claude.js         — Anthropic SDK helper
  hubspot.js        — HubSpot API helper
  context-builder.js — Builds structured deal context
/src
  /components
    Header.jsx
    PipelineRail.jsx   — Deal sidebar with search + stage groups
    DealLayout.jsx     — Main deal view + smart actions
    OutputPanel.jsx    — AI response with copy
    MappingScreen.jsx  — One-time HubSpot property mapping
    AttackPlan.jsx     — Weekly attack plan (slipping/hot/closing)
    DealCard.jsx
    DealGrid.jsx
  /store
    useStore.js        — Zustand state management
  /data
    deals.js           — 46 pipeline + 8 expansion deals
    actions.js         — Smart action definitions
```

## Features

- Full pipeline view: Gut, Best Case, Meeting Qualified, Meeting Set
- Customer expansion tracking (8 accounts)
- Paste HubSpot deal URL to load any deal
- Read-only HubSpot: MEDDPICC, Gong, contacts, activity
- Smart Actions: Follow-Up, Ghost Sequence, GUT Forecast, Meeting Prep, SPIN Deck, MEDDPICC Review
- AI auto-receives all deal context — no manual pasting
- One-time property mapping with auto-discovery of HubSpot fields
- Persistent mapping via Vercel KV (works across devices)
- Reconfigure mapping anytime
- Weekly Attack Plan: slipping, hot, closing soon
