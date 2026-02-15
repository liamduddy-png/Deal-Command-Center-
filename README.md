# Trunk Tools Deal Command Center

AI-powered pipeline management tool for the Trunk Tools sales team.

## Deploy to Vercel (fastest)

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Add environment variables:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
   - `HUBSPOT_ACCESS_TOKEN` = your HubSpot private app access token (optional)
4. Deploy

Share the Vercel URL with your team. Done.

## Run locally

```bash
npm install
npm run dev
```

Create a `.env` file with your API keys:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
HUBSPOT_ACCESS_TOKEN=pat-xxxxx
```

## What's inside

- Full pipeline view with 46 deals (Gut, Best Case, Meeting Qualified, Meeting Set)
- Customer expansion tracking (8 accounts)
- Deal intel from Gong call briefs, Gmail threads, and PandaDoc contracts
- Smart Actions: Follow-Up, Ghost Sequence, GUT Forecast, Meeting Prep, SPIN Deck, MEDDPICC Review, and more
- AI outputs formatted for clean copy/paste into emails, Slack, and decks
- Weekly Attack Plan showing slipping, hot, and closing-soon deals
- Read-only HubSpot integration (MEDDPICC fields, activity, Gong summaries)
