# Ripple 🎬
### Your Social Streaming Queue

**Live Demo:** [ripple-app-ten.vercel.app](https://ripple-app-ten.vercel.app)

---

## The Problem

Streaming discovery doesn't start on Netflix or Peacock. It starts on TikTok, in group chats, on YouTube. Someone sends you a clip, you think "I need to watch that," and then you forget by the time you open the app.

Ripple fixes that. It captures recommendations the moment they happen and turns social discovery into actual viewing.

---

## What It Does

**Save anything instantly** - paste a URL from TikTok, YouTube, or any social platform, or just type a title. Ripple's Claude AI backend reads the page and extracts the show or movie automatically.

**See where to watch** - every title shows which streaming platforms it's on (Peacock, Netflix, Max, Hulu, Disney+, and more), powered by TMDB's provider data.

**Browse by genre** - your queue is automatically organized into sections like 💥 Action, 🎭 Drama, and 😂 Comedy so you can pick based on your mood.

**Get smart recommendations** - when you mark something as watched, Ripple suggests 3 similar titles with their streaming platforms so you always know what to watch next.

**Understand your taste** - the Insights dashboard shows your taste profile, which platforms dominate your queue, where you discover content (TikTok vs YouTube vs friends), and who in your network recommends the most.

---

## Why This Matters for Streaming Platforms

The core insight behind Ripple: social discovery intent doesn't convert to viewing without a bridge.

For a platform like Peacock, the data Ripple captures is genuinely valuable:
- Which social platforms drive the most discovery
- Which recommendation sources lead to actual watch completions
- What genres your social circle is pushing right now
- Whether friend recommendations convert better than algorithmic ones

The north star metric is what I call the **Ripple Activation Rate** - the percentage of saved titles that get watched within 7 days. High activation means social discovery is converting to real viewing sessions.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React |
| Backend | Python FastAPI |
| Database | Supabase (PostgreSQL) |
| AI Extraction | Claude API (Anthropic) |
| Content Data | TMDB API |
| Deployment | Vercel (frontend) |

---

## Key Features

### AI-Powered URL Extraction
Paste any URL and the FastAPI backend fetches the page title, sends it to Claude, and extracts the movie or show name. No manual typing needed.

### Streaming Provider Data
Uses TMDB's `/watch/providers` endpoint to fetch real-time US streaming availability for every title in your queue.

### Genre Classification
TMDB genre IDs are mapped to readable categories and used to automatically group your queue into sections.

### Similar Titles Engine
When you mark a title as watched, Ripple calls TMDB's `/similar` endpoint and fetches provider data for each suggestion, giving you a fully informed "what's next" modal.

### Insights Dashboard
Built entirely from existing queue data with no extra API calls. Analyzes recommender patterns, platform distribution, discovery sources, and taste profile using client-side aggregation.

---

## Architecture
```
User -> React Frontend (Vercel)
            |
      Supabase DB <- stores queue, genre, tmdb_id, media_type, recommender
            |
      TMDB API <- posters, descriptions, genres, providers, similar titles
            |
      FastAPI Backend -> Claude API <- URL extraction
```

---

## Running Locally

**Frontend**
```bash
git clone https://github.com/harsha-suribhatla/Ripple.git
cd Ripple
npm install
```

Create `.env.local`:
```
REACT_APP_TMDB_TOKEN=your_tmdb_token
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_KEY=your_supabase_key
```
```bash
npm start
```

**Backend**
```bash
git clone https://github.com/harsha-suribhatla/ripple-backend.git
cd ripple-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `.env`:
```
ANTHROPIC_API_KEY=your_anthropic_key
```
```bash
uvicorn main:app --reload
```

---

## Built By

**Harsha Suribhatla** - MIS student at San Jose State University, aspiring Product Manager.

Ripple was built as a portfolio project to explore the gap between social media discovery and streaming platforms. The core question I kept coming back to: what if a streaming platform could see exactly where their viewers were discovering content before they ever opened the app?

---

*Built with React, FastAPI, Supabase, Claude API, and TMDB API.*
