# Ripple 🎬
### Your Social Streaming Queue

**Live Demo:** [ripple-app-ten.vercel.app](https://ripple-app-ten.vercel.app)

---

## The Problem

Streaming discovery doesn't start on Netflix or any streaming app. It starts on TikTok, in group chats, on YouTube. Someone sends you a clip, you think "I need to watch that," and then you forget by the time you open the app.

Ripple fixes that. It captures recommendations the moment they happen and turns social discovery into actual viewing.

---

## What It Does

**Save anything instantly** - paste a URL from TikTok, YouTube, or any social platform, type a title, or describe a movie in plain English. Ripple's Claude AI backend figures out what you're talking about automatically.

**Discover by vibe** - the Discover tab lets you describe a movie ("the one with the guy who sees dead people"), drop a poster image, or browse a live conveyor belt of trending titles. Claude identifies it and finds where to watch it.

**See where to watch** - every title shows which streaming platforms it's available on, powered by real-time data from TMDB.

**Browse by genre** - your queue is automatically organized into sections like 💥 Action, 🎭 Drama, and 😂 Comedy so you can pick based on your mood.

**Get smart recommendations** - when you mark something as watched, Ripple suggests 3 similar titles with their streaming platforms so you always know what to watch next.

**Know your Ripple Score** - every title gets a score based on how it was discovered, who recommended it, and where it streams. Click any card to see the full score breakdown.

**Understand your taste** - the Insights dashboard shows your taste profile, which platforms dominate your queue, where you discover content, who in your network recommends the most, and which titles have the highest social buzz.

**Private by default** - sign in with Google and your queue is only visible to you.

---

## Why This Matters for Streaming Platforms

The core insight behind Ripple: social discovery intent doesn't convert to viewing without a bridge.

For any streaming platform, the data Ripple captures is genuinely valuable:
- Which social platforms drive the most discovery
- Which recommendation sources lead to actual watch completions
- What genres your social circle is pushing right now
- Whether friend recommendations convert better than algorithmic ones
- Which titles have the highest social buzz before they even get watched

The north star metric is what I call the **Ripple Activation Rate** - the percentage of saved titles that get watched within 7 days. High activation means social discovery is converting to real viewing sessions.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React |
| Backend | Python FastAPI |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth) |
| AI | Claude API (Anthropic) |
| Content Data | TMDB API |
| Deployment | Vercel (frontend) |

---

## Key Features

### AI-Powered URL Extraction
Paste any URL and the FastAPI backend fetches the page title, sends it to Claude, and extracts the movie or show name. No manual typing needed.

### Natural Language and Image Search
Describe a movie in plain English or drop a poster image — Claude identifies the title and Ripple finds it in TMDB automatically.

### Trending Conveyor Belt
The Discover tab shows a live scrolling belt of trending titles from TMDB. Hover to pause, click to see details and add to your queue.

### Streaming Provider Data
Uses TMDB's `/watch/providers` endpoint to fetch real-time US streaming availability for every title in your queue.

### Ripple Score
Every title gets a score from 0 to 100 based on social signal strength — whether it came from a friend, which platform it was found on, and where it streams. Click any card to see a full breakdown of how the score was calculated.

### Genre Classification
TMDB genre IDs are mapped to readable categories and used to automatically group your queue into sections.

### Source Tracking
When you paste a URL, Ripple automatically detects whether it came from TikTok, YouTube, Instagram, Reddit, or another platform and logs it. The Insights dashboard shows exactly where your queue is coming from.

### Similar Titles Engine
When you mark a title as watched, Ripple calls TMDB's `/similar` endpoint and fetches provider data for each suggestion, giving you a fully informed "what's next" modal.

### Insights Dashboard
Built entirely from existing queue data with no extra API calls. Analyzes recommender patterns, platform distribution, discovery sources, taste profile, and top Ripple Scores using client-side aggregation.

### Already Watching Badge
Titles available on platforms you already subscribe to are highlighted automatically so you know what you can watch right now.

---

## Architecture
```
User -> React Frontend (Vercel)
            |
      Supabase Auth <- Google OAuth login
            |
      Supabase DB <- queue, genre, tmdb_id, media_type, recommender, source, user_id
            |
      TMDB API <- posters, descriptions, genres, providers, similar titles, trending
            |
      FastAPI Backend -> Claude API <- URL extraction, natural language search, image identification
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
