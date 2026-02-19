# Trunk Tools SDR Signal Engine

High-volume SDR/BDR outbound copilot for Trunk Tools.

This repo contains a deployable prompt pack that generates persona-specific, construction-native outbound messaging tied to operational friction and business impact (time, rework, risk, margin). It's built for early-stage pipeline creation only.

## What it does
- Cold emails (3 options with subject lines)
- LinkedIn openers (3 options)
- Call openers (3 x 30 seconds)
- Voicemails (2 scripts)
- SPIN/SPICED-style discovery questions (8–10)
- Follow-up nudges (3 options)
- Persona hooks (3 options)

## What it does NOT do
- Pricing guidance (no numbers, no packaging)
- Pilot design / implementation planning
- Forecasting / stages / MEDDPICC deep dives
- Legal/security claims beyond "security review may apply"
- Invented ROI, logos, timelines, or customer claims

## Product positioning (locked)
Trunk Tools is construction-native AI that:
- Compares drawing versions (drawing review)
- Reviews submittals against specs (submittal review)
- Answers field questions via text (Trunk Text)
- Cross-references project docs (specs, RFIs, submittals, drawings, logs) via system-of-record integrations (ACC/Procore/SharePoint)

Primary outcomes:
- Less manual document combing
- Faster review cycles
- Fewer misses that lead to rework
- Better field access to the "source of truth"

## Usage (copy/paste prompt)
Use the command format below in Claude/GPT:

```
Persona:
Company Type:
Project Type:
Main Friction:
Tool Stack (if known):
Mode: (call / email / LinkedIn / voicemail)

Command:
(cold_email / call_opener / linkedin / voicemail / discovery_questions / followup / hook)
```

Example:
```
Persona: Project Manager
Company Type: Regional GC
Project Type: Healthcare
Main Friction: Submittal reviews + drawing conflicts
Tool Stack: ACC
Mode: email
Command: cold_email
```

## License
MIT
