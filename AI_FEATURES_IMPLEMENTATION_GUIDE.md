# AI Features Implementation Guide

This guide explains how to implement the four AI-powered features in your Green Space Optimizer project: **area notifications**, **optimal drive time**, **post-campaign scoring & virtual jungle**, and **personal sustainability chatbot**.

---

## Overview of the Four Features

| # | Feature | What it does | Status in your project |
|---|--------|--------------|-------------------------|
| 1 | **Area need cleaning + notifications** | Find areas that need cleaning/maintenance → send notifications to locals with instructions | You have **priority locations** (AQI, garbage, last camp). Need: **notifications** + **instructions per area**. |
| 2 | **Perfect drive time** | Suggest best time for drives (weekends, occasions) | You have a simple **suggestDriveTime**. Need: **weekend/holiday awareness** + better logic or AI. |
| 3 | **Post-campaign score + virtual jungle** | After a drive, calculate score and update virtual jungle from work done | **Already implemented**: `submitDriveWork`, `calculateScoreFromWork`, `virtualJungleLevel`. Can enhance with recap. |
| 4 | **Personal sustainability chatbot** | AI chatbot at home for personalized tips → user logs activities → score + carbon/AQI per action | You have **daily habit** + **completeHabit**. Need: **chat UI**, **LLM API**, **personal activities** with carbon/AQI. |

---

## Technologies Needed

| Purpose | Technology | Why |
|--------|------------|-----|
| **Notifications** (area alerts to locals) | **Node: nodemailer** (email) and/or **in-app notifications** (DB + API) | Email is easy; in-app needs a Notification model and a "my area" preference. |
| **Instructions per area** | **Rule-based** (your backend) or **LLM API** (OpenAI / Gemini) | Rule-based: map area type + AQI + garbage → text. LLM: one API call to get "what to do here". |
| **Best drive time** | **Rule-based** (weekends, existing drives) + optional **Calendar/Weather API** | Use weekends + user preferences + conflict check; optionally add weather. |
| **Chatbot (personalized sustainability)** | **LLM API** (OpenAI, Google Gemini, or OpenAI-compatible) | Chat endpoint that sends user message + context (score, habits) to LLM, returns suggestion. |
| **Carbon / AQI per personal action** | **Your backend** (formulas per activity type) | Same idea as `aiScoring`: define coins + carbon + AQI per activity, store in Score. |

**Recommended stack for “easy to implement”:**

- **Backend:** Node + Express (you have this).
- **Notifications:** In-app (Notification model + GET/POST API) + optional email (nodemailer).
- **Instructions:** Rule-based first (no API key); add LLM later for richer text.
- **Chatbot:** One LLM provider (e.g. **OpenAI** or **Google AI Gemini**) via their Node SDK.
- **Database:** MongoDB (you have this); add collections: `Notification`, optionally `PersonalActivity` or extend Score/habits.

---

## Feature 1: Areas That Need Cleaning + Notifications to Locals

**Goal:** For a given area (or list of priority areas), send notifications to users in that area with instructions on what to do.

### What you already have

- **Priority locations** – `GET /api/locations/priority` (or similar) returns areas by AQI, garbage, last camp.
- **Location** model – name, region, aqi, garbageLevel, etc.
- **User** model – has `area` (profile) and `region`.

### What to add

1. **Notification model** (backend)  
   - Fields: `user`, `title`, `body`, `type` (e.g. `area_alert`), `area/location`, `read`, `createdAt`.  
   - So you can “send” a notification = create a document per user.

2. **“Instructions” per area**  
   - **Option A (rule-based):** In your backend, for each location compute a short text: e.g. “High garbage – focus on plastic and cans; wear gloves.” from `garbageLevel`, `aqi`, `hasPond`, etc.  
   - **Option B (LLM):** One API call per area (or per batch): “Given AQI=X, garbage=Y, hasPond=Z, suggest 3–4 short instructions for locals.” Store result in Location or in the notification `body`.

3. **“Users in area”**  
   - Query users whose profile `area` or `region` matches the location’s region (or use a separate “subscribed areas” array).  
   - For each user, create a **Notification** document with title, body (instructions), type, location ref.

4. **API**  
   - `POST /api/notifications/send-area-alert` (admin or cron): body = `{ locationId }` or `{ region }`.  
     - Load location, compute instructions (rule-based or LLM).  
     - Find users in that area, create Notification for each.  
   - `GET /api/notifications` (auth): list notifications for current user (paginated).  
   - `PATCH /api/notifications/:id/read`: mark read.

5. **Frontend**  
   - Navbar or dashboard: bell icon + count of unread notifications.  
   - Notifications page: list of notifications; each shows area name + instructions (body).

### Easy steps (summary)

1. Add **Notification** model and **notifications** route + controller.  
2. Add **rule-based instructions** function: `getInstructionsForLocation(location)` → string.  
3. Add **send-area-alert** endpoint that: gets location → gets instructions → finds users in area → creates notifications.  
4. Frontend: **GET notifications**, **mark read**, and a simple **notifications UI**.

---

## Feature 2: Perfect Time for Drives (Weekends / Occasions)

**Goal:** Suggest the best time (e.g. weekend slots or special occasions) for a drive at a location.

### What you already have

- **suggestDriveTime** – simple “Sunday 09:00–12:00” or “14:00–17:00” based on existing drives.  
- **Drive** model – date, timeSlot, location.  
- **User** – `preferredTimePoll` (e.g. preferred days/slots).

### What to add

1. **Weekend logic**  
   - Prefer Saturday/Sunday; optionally exclude dates that already have a drive at that location.  
   - Return 2–3 suggested slots (e.g. “Sat 9–12”, “Sun 9–12”).

2. **Occasions**  
   - Optional: small **Occasion** collection (e.g. “Earth Day”, “Clean India”) with date.  
   - Suggest “This weekend” or “On [occasion name]” in the response.

3. **Optional: weather**  
   - If you add a weather API (e.g. Open-Meteo free tier), filter out slots with heavy rain.

4. **API**  
   - Keep/enhance `POST /api/ai/suggest-time` (or similar): input `locationId`, optional `preferredWeekend`.  
   - Response: `{ suggestedSlots: [{ date, timeSlot, label }], reason: "Weekend, no conflict" }`.

### Easy steps (summary)

1. In **suggestDriveTime** (or a new service `getOptimalDriveTimes`):  
   - Get next 2–3 weekends (or next 14 days).  
   - For each, check Drive conflict for that location.  
   - Return best slots; add a short `reason` string.  
2. Optionally add **Occasion** model and include “occasion” in the suggestion.  
3. Frontend: drive creation form calls suggest-time and shows suggested slots as quick picks.

---

## Feature 3: Post-Campaign Score + Virtual Jungle Update

**Goal:** After a campaign/drive, calculate each participant’s score and update their virtual jungle based on work done; optionally show carbon and AQI impact.

### What you already have

- **submitDriveWork** – accepts `timeMinutes`, `plantsPlanted`, `areaCleanedSqm`, `wasteGatheredKg`.  
- **calculateScoreFromWork** – returns coins, aqiReduced, carbonFootprintReducedKg.  
- **Score** – coins, aqiReduced, carbonFootprintReducedKg, virtualJungleLevel (e.g. `floor(coins/50)`).  
- **completeHabit** – same Score update pattern for habits.

So: **scoring and virtual jungle update after work are already there.** You only need to **trigger** this when a drive is completed (and optionally show a recap).

### What to add

1. **Drive completion flow**  
   - When incharge (or admin) marks a drive as **completed**, either:  
     - **Option A:** They also submit “work done” per participant (or per drive totals).  
     - **Option B:** Each participant submits their own work via existing **submitDriveWork** after the drive (you can pass `driveId` and store it for history).  
   - In both cases you keep using **submitDriveWork** and **calculateScoreFromWork**; no change to formula needed for “after campaign” – it’s the same function.

2. **Recap / history**  
   - Optional: **DriveResult** or **ScoreHistory** document per “drive submission” (user, drive, coins earned, aqiReduced, carbonReduced).  
   - Then: “After this campaign you earned X coins, reduced Y kg carbon, Z AQI points.”

3. **Virtual jungle**  
   - You already set `virtualJungleLevel = Math.floor(score.coins / 50)` in **submitDriveWork** and **completeHabit**. So virtual jungle **is** updated after each work submission.  
   - Frontend: Virtual Jungle component already uses `score.coins` and `score.virtualJungleLevel`; no backend change required for the baseline.

### Easy steps (summary)

1. Ensure **drive completion** (status = completed) is implemented and that participants (or incharge) can call **submitDriveWork** with the actual numbers after the drive.  
2. Optionally add **driveId** to the payload and save a **ScoreHistory** or **DriveResult** row for “after this campaign” recap.  
3. Frontend: after submit, show “You earned X coins; AQI reduced by Y; Carbon reduced by Z kg; Virtual jungle level is now L.”

---

## Feature 4: Personal Sustainability Chatbot + Score / Carbon / AQI per Action

**Goal:** User talks to a personalized “sustainability improver” chatbot at home; gets suggestions; when they do an action, they log it and get score + carbon footprint + AQI reduced per action.

### What you already have

- **Daily habit** – one habit per day; **completeHabit(points)** adds coins and habitCompletions.  
- **Score** – coins, aqiReduced, carbonFootprintReducedKg, virtualJungleLevel.

### What to add

1. **LLM integration (backend)**  
   - Choose one: **OpenAI** (e.g. `openai` npm) or **Google AI** (e.g. `@google/generative-ai`).  
   - Env: `OPENAI_API_KEY` or `GEMINI_API_KEY`.  
   - New endpoint: e.g. `POST /api/ai/chat` body `{ message }`.  
   - Backend loads current user’s **Score** (and optionally recent habits). Build a system prompt: “You are a sustainability coach. User’s current coins: X, AQI reduced: Y, carbon reduced: Z. Suggest one small action they can do at home today.”  
   - Send `message` + system prompt to LLM; return assistant reply.

2. **Personal activities (optional but useful)**  
   - **PersonalActivity** model: user, type (e.g. `steel_bottle`, `lights_off`, `compost`), doneAt, points, carbonSavedKg, aqiPoints.  
   - Or reuse **Habit** and **completeHabit** with a “personal” category and fixed points/carbon/AQI per type.  
   - When user “completes” an action (from chatbot suggestion or from a list), call an endpoint that:  
     - Adds coins (like completeHabit).  
     - Adds to **carbonFootprintReducedKg** and **aqiReduced** with small per-activity constants (e.g. steel_bottle: 0.1 kg carbon, 0.5 AQI).  
   - Same **Score** document; same **virtualJungleLevel** formula.

3. **Chat UI (frontend)**  
   - A “Sustainability assistant” or “Chat” section on dashboard or a dedicated page.  
   - Input + “Send”; call `POST /api/ai/chat` with `message`; display assistant reply.  
   - Optional: “I did this” button that calls your “complete personal action” endpoint with the suggested action type.

4. **Formulas for personal actions**  
   - In backend, define a map, e.g. `personalActionImpact = { steel_bottle: { coins: 5, carbonKg: 0.1, aqi: 0.5 }, lights_off: { coins: 3, carbonKg: 0.05, aqi: 0.2 }, ... }`.  
   - When user completes an action, look up by type and add to Score.

### Easy steps (summary)

1. **Backend:** Add **OpenAI** or **Gemini** SDK; add **POST /api/ai/chat** with system prompt including user’s score; return LLM reply.  
2. **Backend:** Add **POST /api/scoring/personal-action** (or extend completeHabit) body `{ actionType }`; apply coins + carbon + AQI from a small table; update Score and virtualJungleLevel.  
3. **Frontend:** Chat component (textarea + send), call chat API, show reply; optional “I did this” → call personal-action API.  
4. **Env:** Set `OPENAI_API_KEY` or `GEMINI_API_KEY` in backend `.env`.

---

## Implementation Order (Suggested)

1. **Feature 3** – Confirm post-campaign flow and recap (you’re 90% there).  
2. **Feature 2** – Improve suggest drive time (weekends + reasons).  
3. **Feature 1** – Notifications model + rule-based instructions + send-area-alert.  
4. **Feature 4** – Chat endpoint + personal action scoring + chat UI.

---

## Quick Reference: APIs to Add

| Feature | Method | Endpoint | Auth | Purpose |
|--------|--------|----------|------|--------|
| 1 | POST | `/api/notifications/send-area-alert` | Admin | Create notifications for users in area with instructions |
| 1 | GET | `/api/notifications` | User | List my notifications |
| 1 | PATCH | `/api/notifications/:id/read` | User | Mark read |
| 2 | POST | `/api/ai/suggest-time` | - | Enhance: return multiple slots + reason (weekends/occasions) |
| 3 | (existing) | `POST /api/scoring/drive` | User | Submit drive work (already updates score + virtual jungle) |
| 4 | POST | `/api/ai/chat` | User | Send message to LLM; return sustainability suggestion |
| 4 | POST | `/api/scoring/personal-action` | User | Log personal action; add coins + carbon + AQI |

---

## Environment Variables (for AI features)

```env
# Optional: for area instructions or chatbot
OPENAI_API_KEY=sk-...
# OR
GEMINI_API_KEY=...

# Optional: for email notifications (Feature 1)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

---

## Summary

- **Feature 1:** Notifications (DB + API) + rule-based (or LLM) instructions per area; send to users in that area.  
- **Feature 2:** Improve suggest-time with weekends and conflict check; optional occasions/weather.  
- **Feature 3:** You already have scoring and virtual jungle; wire drive completion to **submitDriveWork** and optionally add recap/history.  
- **Feature 4:** LLM chat endpoint + personal-action endpoint (score + carbon + AQI) + chat UI.

If you tell me which feature you want to implement first (1, 2, 3, or 4), I can give you concrete code steps (models, routes, controller functions) tailored to your repo structure.
