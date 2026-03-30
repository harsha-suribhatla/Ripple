/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const TMDB_TOKEN = process.env.REACT_APP_TMDB_TOKEN;

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

const D = {
  bg: "#0f0f0f",
  sidebar: "#111",
  card: "#1a1a1a",
  card2: "#222",
  border: "#2a2a2a",
  text: "#fff",
  muted: "#888",
  accent: "#4f8ef7",
  accentDim: "#1a2a4a",
  green: "#22c55e",
  purple: "#a78bfa",
  red: "#ef4444",
};

const GENRE_MAP = {
  28: "Action & Adventure", 12: "Action & Adventure", 10759: "Action & Adventure",
  35: "Comedy", 10751: "Comedy",
  18: "Drama", 10766: "Drama",
  27: "Horror", 53: "Horror",
  878: "Sci-Fi & Fantasy", 14: "Sci-Fi & Fantasy", 10765: "Sci-Fi & Fantasy",
  9648: "Mystery & Thriller", 80: "Mystery & Thriller",
  10749: "Romance",
  99: "Documentary",
  16: "Animation",
  10402: "Music",
};

function getGenre(genreIds) {
  if (!genreIds || genreIds.length === 0) return "Other";
  for (let id of genreIds) {
    if (GENRE_MAP[id]) return GENRE_MAP[id];
  }
  return "Other";
}

const GENRE_EMOJI = {
  "Action & Adventure": "💥", "Comedy": "😂", "Drama": "🎭",
  "Horror": "😱", "Sci-Fi & Fantasy": "🚀", "Mystery & Thriller": "🔍",
  "Romance": "💕", "Documentary": "🎥", "Animation": "✨",
  "Music": "🎵", "Other": "🎬",
};

const PLATFORM_COLORS = {
  "Peacock": { bg: "#1a1a2e", color: "#a78bfa", border: "#4c1d95" },
  "Netflix": { bg: "#1a0a0a", color: "#ef4444", border: "#7f1d1d" },
  "Max": { bg: "#0a0a2e", color: "#60a5fa", border: "#1e3a8a" },
  "Hulu": { bg: "#0a1a0a", color: "#22c55e", border: "#14532d" },
  "Disney+": { bg: "#0a0a2e", color: "#818cf8", border: "#3730a3" },
  "Apple TV+": { bg: "#1a1a1a", color: "#e5e7eb", border: "#374151" },
  "Amazon Prime Video": { bg: "#0a1a2e", color: "#38bdf8", border: "#0c4a6e" },
  "Paramount+": { bg: "#0a0a2e", color: "#60a5fa", border: "#1e3a8a" },
};

const PLATFORM_BAR_COLORS = {
  "Peacock": "#a78bfa", "Netflix": "#ef4444", "Max": "#60a5fa",
  "Hulu": "#22c55e", "Disney+": "#818cf8", "Apple TV+": "#e5e7eb",
  "Amazon Prime Video": "#38bdf8", "Paramount+": "#60a5fa",
};

const SOURCE_COLORS = {
  "TikTok": "#ff0050", "YouTube": "#FF0000", "Instagram": "#E1306C",
  "Twitter": "#1DA1F2", "Reddit": "#FF4500", "Snapchat": "#FFFC00",
  "Facebook": "#1877F2", "Direct": "#4f8ef7", "Link": "#888", "Friend": "#a78bfa",
};

const PROVIDER_NAME_MAP = {
  8: "Netflix", 9: "Amazon Prime Video", 15: "Hulu", 337: "Disney+",
  384: "Max", 386: "Peacock", 387: "Peacock", 389: "Peacock",
  531: "Paramount+", 350: "Apple TV+",
};

const SOURCE_PLATFORMS = ["tiktok", "youtube", "instagram", "twitter", "reddit", "snapchat", "facebook"];

// User's platforms — in a real app this would be set by the user
const MY_PLATFORMS = ["Netflix", "Hulu", "Max"];

function detectUrlSource(input) {
  if (!input.startsWith("http")) return "Friend";
  if (input.includes("tiktok.com")) return "TikTok";
  if (input.includes("youtube.com") || input.includes("youtu.be")) return "YouTube";
  if (input.includes("instagram.com")) return "Instagram";
  if (input.includes("twitter.com") || input.includes("x.com")) return "Twitter";
  if (input.includes("reddit.com")) return "Reddit";
  if (input.includes("facebook.com")) return "Facebook";
  if (input.includes("snapchat.com")) return "Snapchat";
  return "Link";
}

function calcRippleScore(item, itemProviders) {
  let score = 0;
  // Has a recommender = social signal
  if (item.recommender && item.recommender !== "Ripple") score += 30;
  // Came from social media = higher intent
  const socialSources = ["TikTok", "YouTube", "Instagram", "Twitter", "Reddit"];
  if (socialSources.includes(item.source)) score += 25;
  // Available on streaming = watchable
  if (itemProviders && itemProviders.length > 0) score += 20;
  // Available on a popular platform
  if (itemProviders && itemProviders.includes("Netflix")) score += 10;
  if (itemProviders && itemProviders.includes("Peacock")) score += 10;
  // Has full metadata
  if (item.genre && item.genre !== "Other") score += 5;
  return Math.min(score, 100);
}

function getRippleScoreColor(score) {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#4f8ef7";
  return "#888";
}

async function fetchProviders(tmdbId, mediaType) {
  if (!tmdbId || !mediaType) return [];
  const res = await fetch(
    `https://api.themoviedb.org/3/${mediaType}/${tmdbId}/watch/providers`,
    { headers: { Authorization: `Bearer ${TMDB_TOKEN}` } }
  );
  const data = await res.json();
  const usProviders = data?.results?.US?.flatrate || [];
  const seen = new Set();
  const platforms = [];
  for (let p of usProviders) {
    const name = PROVIDER_NAME_MAP[p.provider_id];
    if (name && !seen.has(name)) { seen.add(name); platforms.push(name); }
  }
  return platforms;
}

async function fetchSimilar(tmdbId, mediaType) {
  if (!tmdbId || !mediaType) return [];
  const res = await fetch(
    `https://api.themoviedb.org/3/${mediaType}/${tmdbId}/similar`,
    { headers: { Authorization: `Bearer ${TMDB_TOKEN}` } }
  );
  const data = await res.json();
  return (data.results || []).slice(0, 3);
}

function LoginScreen() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: D.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: "400px", padding: "40px 20px" }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎬</div>
        <h1 style={{ fontSize: "40px", fontWeight: "900", color: D.text, marginBottom: "8px", letterSpacing: "-1px" }}>Ripple</h1>
        <p style={{ color: D.muted, fontSize: "16px", marginBottom: "40px", lineHeight: "1.5" }}>
          Your social streaming queue. Save anything, find where to watch it, discover what's next.
        </p>
        <button onClick={handleLogin} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", width: "100%", padding: "14px 24px", background: "#fff", color: "#111", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        <p style={{ color: D.muted, fontSize: "12px", marginTop: "20px" }}>Your queue is private and only visible to you.</p>
      </div>
    </div>
  );
}

function Sidebar({ tab, setTab, queue, watched, user }) {
  const navItems = [
    { id: "discover", icon: "🔍", label: "Discover" },
    { id: "queue", icon: "🎬", label: "Queue", count: queue.length },
    { id: "watched", icon: "✅", label: "Watched", count: watched.length },
    { id: "insights", icon: "📊", label: "Insights" },
  ];

  return (
    <div style={{ width: "220px", minHeight: "100vh", background: D.sidebar, borderRight: `1px solid ${D.border}`, display: "flex", flexDirection: "column", position: "fixed", left: 0, top: 0, bottom: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ padding: "28px 20px 20px" }}>
        <div style={{ fontSize: "22px", fontWeight: "900", color: D.text, letterSpacing: "-0.5px" }}>Ripple 🎬</div>
        <div style={{ fontSize: "12px", color: D.muted, marginTop: "4px" }}>{user?.user_metadata?.full_name?.split(" ")[0] || "Hey there"} 👋</div>
      </div>
      <div style={{ padding: "0 12px", flex: 1 }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", border: "none", background: tab === item.id ? D.accentDim : "transparent", color: tab === item.id ? D.accent : D.muted, cursor: "pointer", fontSize: "14px", fontWeight: tab === item.id ? "700" : "500", marginBottom: "4px", textAlign: "left" }}>
            <span style={{ fontSize: "16px" }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.count !== undefined && (
              <span style={{ fontSize: "11px", background: tab === item.id ? D.accent : D.border, color: tab === item.id ? "#fff" : D.muted, padding: "1px 7px", borderRadius: "20px", fontWeight: "700" }}>{item.count}</span>
            )}
          </button>
        ))}
      </div>
      <div style={{ padding: "20px 12px", borderTop: `1px solid ${D.border}` }}>
        {user?.user_metadata?.avatar_url && (
          <img src={user.user_metadata.avatar_url} alt="avatar" style={{ width: "32px", height: "32px", borderRadius: "50%", marginBottom: "10px" }} />
        )}
        <div style={{ fontSize: "12px", color: D.muted, marginBottom: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
        <button onClick={() => supabase.auth.signOut()} style={{ width: "100%", padding: "8px", borderRadius: "8px", background: D.card2, border: `1px solid ${D.border}`, color: D.muted, cursor: "pointer", fontSize: "12px" }}>Sign out</button>
      </div>
    </div>
  );
}

function ConveyorBelt({ onSelect }) {
  const [posters, setPosters] = useState([]);
  const trackRef = useRef(null);

  useEffect(() => {
    async function loadTrending() {
      const res = await fetch(
        `https://api.themoviedb.org/3/trending/all/week`,
        { headers: { Authorization: `Bearer ${TMDB_TOKEN}` } }
      );
      const data = await res.json();
      const results = (data.results || []).filter(r => r.poster_path).slice(0, 20);
      setPosters([...results, ...results]);
    }
    loadTrending();
  }, []);

  return (
    <div style={{ overflow: "hidden", width: "100%", position: "relative", marginBottom: "40px" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", zIndex: 2, background: "linear-gradient(to right, #0f0f0f, transparent)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", zIndex: 2, background: "linear-gradient(to left, #0f0f0f, transparent)", pointerEvents: "none" }} />
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .conveyor-track {
          display: flex;
          gap: 12px;
          animation: scroll 40s linear infinite;
          width: max-content;
        }
        .conveyor-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="conveyor-track" ref={trackRef}>
        {posters.map((movie, i) => (
          <div key={`${movie.id}-${i}`} onClick={() => onSelect(movie)}
            style={{ flexShrink: 0, cursor: "pointer", position: "relative", borderRadius: "10px", overflow: "hidden", transition: "transform 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title || movie.name}
              style={{ width: "120px", height: "180px", objectFit: "cover", display: "block", borderRadius: "10px" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)", padding: "20px 8px 8px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#fff", textAlign: "center" }}>
                {(movie.title || movie.name)?.slice(0, 20)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiscoverTab({ onAddToQueue }) {
  const [query, setQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [resultProviders, setResultProviders] = useState([]);
  const [added, setAdded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [image, setImage] = useState(null);

  async function handleSearch() {
    if (!query && !image) return;
    setAiLoading(true);
    setResult(null);
    setAdded(false);
    try {
      const aiRes = await fetch("http://127.0.0.1:8000/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query || null,
          image_data: image?.data || null,
          image_type: image?.type || null,
        })
      });
      const aiData = await aiRes.json();
      const title = aiData.title?.trim();
      if (!title) { setAiLoading(false); return; }
      const tmdbRes = await fetch(
        `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(title)}`,
        { headers: { Authorization: `Bearer ${TMDB_TOKEN}` } }
      );
      const tmdbData = await tmdbRes.json();
      const movie = tmdbData.results?.[0];
      if (movie) {
        const platforms = await fetchProviders(movie.id, movie.media_type);
        setResult(movie);
        setResultProviders(platforms);
      }
    } catch (e) { console.error(e); }
    setAiLoading(false);
  }

  function handleImageDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      setImage({ data: base64, type: file.type });
      setQuery("");
    };
    reader.readAsDataURL(file);
  }

  async function handleAdd() {
    if (!result) return;
    await onAddToQueue(result);
    setAdded(true);
  }

  function handleBeltSelect(movie) {
    setResult(movie);
    setResultProviders([]);
    setAdded(false);
    fetchProviders(movie.id, movie.media_type).then(setResultProviders);
  }

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "4px", color: D.text }}>🔍 Discover</h2>
      <p style={{ color: D.muted, fontSize: "13px", marginBottom: "28px" }}>Describe a movie, drop an image, or browse what's trending</p>
      <ConveyorBelt onSelect={handleBeltSelect} />
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleImageDrop}
        style={{ background: dragOver ? "#1a2a1a" : D.card, border: `2px dashed ${dragOver ? D.green : D.border}`, borderRadius: "14px", padding: "20px", marginBottom: "12px", transition: "all 0.2s" }}
      >
        {image ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src={`data:${image.type};base64,${image.data}`} alt="uploaded" style={{ width: "50px", height: "70px", objectFit: "cover", borderRadius: "6px" }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: D.text, fontSize: "13px", marginBottom: "4px" }}>Image ready — Claude will identify it</div>
              <button onClick={() => setImage(null)} style={{ fontSize: "11px", color: D.muted, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>🖼️</div>
            <div style={{ color: D.muted, fontSize: "13px", marginBottom: "8px" }}>Drop a poster or screenshot here</div>
            <label style={{ cursor: "pointer", color: D.accent, fontSize: "12px", fontWeight: "600" }}>
              or click to upload
              <input type="file" accept="image/*" onChange={handleImageDrop} style={{ display: "none" }} />
            </label>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <input
          placeholder='Describe it... "the one with the guy who sees dead people"'
          value={query}
          onChange={(e) => { setQuery(e.target.value); setImage(null); }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{ flex: 1, padding: "14px 16px", borderRadius: "10px", border: `1px solid ${D.border}`, background: D.card, color: D.text, fontSize: "14px", outline: "none" }}
        />
        <button onClick={handleSearch} disabled={aiLoading}
          style={{ padding: "14px 20px", borderRadius: "10px", background: D.accent, color: "#fff", border: "none", fontWeight: "700", cursor: "pointer", fontSize: "14px", whiteSpace: "nowrap" }}>
          {aiLoading ? "..." : "Find it"}
        </button>
      </div>
      {result && (
        <div style={{ background: D.card, borderRadius: "14px", border: `1px solid ${D.border}`, padding: "20px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
          {result.poster_path && <img src={`https://image.tmdb.org/t/p/w200${result.poster_path}`} alt={result.title || result.name} style={{ width: "80px", borderRadius: "8px", flexShrink: 0 }} />}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "800", fontSize: "18px", color: D.text, marginBottom: "4px" }}>{result.title || result.name}</div>
            <div style={{ fontSize: "12px", color: D.muted, marginBottom: "10px", lineHeight: "1.5" }}>{result.overview?.slice(0, 120)}...</div>
            {resultProviders.length > 0 && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                {resultProviders.map(platform => (
                  <span key={platform} style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", background: PLATFORM_COLORS[platform]?.bg || D.card2, color: PLATFORM_COLORS[platform]?.color || D.text, border: `1px solid ${PLATFORM_COLORS[platform]?.border || D.border}` }}>
                    {platform}
                  </span>
                ))}
              </div>
            )}
            <button onClick={handleAdd} disabled={added}
              style={{ padding: "8px 18px", borderRadius: "8px", background: added ? "#0f2a1a" : D.accent, color: added ? D.green : "#fff", border: added ? "1px solid #14532d" : "none", fontWeight: "700", cursor: added ? "default" : "pointer", fontSize: "13px" }}>
              {added ? "✓ Added to Queue" : "+ Add to Queue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ emoji, label, value, sub, color }) {
  return (
    <div style={{ flex: 1, minWidth: "120px", background: D.card, borderRadius: "14px", padding: "16px", border: `1px solid ${D.border}` }}>
      <div style={{ fontSize: "20px", marginBottom: "6px" }}>{emoji}</div>
      <div style={{ fontSize: "10px", color: D.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "20px", fontWeight: "800", color: color || D.text }}>{value}</div>
      {sub && <div style={{ fontSize: "11px", color: D.muted, marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

function BarChart({ data, colorMap, total }) {
  if (!data || data.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {data.map(([name, count]) => (
        <div key={name}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
            <span style={{ fontWeight: "600", color: D.text }}>{name}</span>
            <span style={{ color: D.muted }}>{count} ({Math.round((count / total) * 100)}%)</span>
          </div>
          <div style={{ background: D.border, borderRadius: "99px", height: "6px", overflow: "hidden" }}>
            <div style={{ width: `${(count / total) * 100}%`, height: "100%", borderRadius: "99px", background: colorMap?.[name] || D.accent, transition: "width 0.5s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightsTab({ allItems, providers, queue, watched }) {
  const peopleMap = {};
  const platformCounts = {};
  const genreCounts = {};
  const sourceCounts = {};

  for (let item of allItems) {
    if (item.genre) genreCounts[item.genre] = (genreCounts[item.genre] || 0) + 1;
    if (item.source) sourceCounts[item.source] = (sourceCounts[item.source] || 0) + 1;
    if (!item.recommender || item.recommender === "Ripple") continue;
    const name = item.recommender;
    if (!peopleMap[name]) peopleMap[name] = { count: 0, platforms: {} };
    peopleMap[name].count++;
    const itemPlatforms = providers[item.id] || [];
    for (let p of itemPlatforms) {
      peopleMap[name].platforms[p] = (peopleMap[name].platforms[p] || 0) + 1;
      platformCounts[p] = (platformCounts[p] || 0) + 1;
    }
  }

  const sorted = Object.entries(peopleMap).sort((a, b) => b[1].count - a[1].count);
  const sortedPlatforms = Object.entries(platformCounts).sort((a, b) => b[1] - a[1]);
  const sortedSources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);
  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const totalPlatforms = sortedPlatforms.reduce((s, [, c]) => s + c, 0);
  const totalSources = sortedSources.reduce((s, [, c]) => s + c, 0);
  const totalGenres = sortedGenres.reduce((s, [, c]) => s + c, 0);
  const topRecommender = sorted[0];
  const topPlatform = sortedPlatforms[0];
  const topSource = sortedSources[0];

  // Top Ripple Score items
  const topRipple = [...allItems]
    .map(item => ({ ...item, score: calcRippleScore(item, providers[item.id]) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const sectionStyle = { background: D.card, borderRadius: "14px", padding: "20px", border: `1px solid ${D.border}`, marginBottom: "14px" };

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "4px", color: D.text }}>📊 Ripple Insights</h2>
      <p style={{ color: D.muted, fontSize: "13px", marginBottom: "20px" }}>Your personal streaming intelligence</p>

      <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
        <StatCard emoji="🎬" label="In Queue" value={queue.length} color={D.accent} />
        <StatCard emoji="✅" label="Watched" value={watched.length} color={D.green} />
        {topRecommender && <StatCard emoji="👑" label="Top Recommender" value={topRecommender[0]} sub={`${topRecommender[1].count} picks`} color={D.purple} />}
        {topPlatform && <StatCard emoji="📺" label="Top Platform" value={topPlatform[0]} sub={`${topPlatform[1]} titles`} color="#f59e0b" />}
        {topSource && <StatCard emoji="📡" label="Top Source" value={topSource[0]} sub={`${topSource[1]} titles`} color="#ff0050" />}
      </div>

      {/* Ripple Score leaderboard */}
      {topRipple.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "4px", color: D.text }}>⚡ Top Ripple Scores</h3>
          <p style={{ fontSize: "12px", color: D.muted, marginBottom: "16px" }}>Titles with the highest social buzz and streaming availability</p>
          {topRipple.map((item, i) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: i < topRipple.length - 1 ? `1px solid ${D.border}` : "none" }}>
              <div style={{ fontSize: "18px", width: "24px", textAlign: "center" }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</div>
              {item.poster && <img src={item.poster} alt={item.title} style={{ width: "36px", borderRadius: "4px", flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: "700", fontSize: "13px", color: D.text }}>{item.title}</div>
                <div style={{ fontSize: "11px", color: D.muted }}>{item.source || "Direct"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "18px", fontWeight: "900", color: getRippleScoreColor(item.score) }}>{item.score}</div>
                <div style={{ fontSize: "10px", color: D.muted }}>score</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {sortedSources.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "4px", color: D.text }}>📡 Where Your Queue Comes From</h3>
          <p style={{ fontSize: "12px", color: D.muted, marginBottom: "16px" }}>Automatically detected from URLs you paste</p>
          <BarChart data={sortedSources} colorMap={SOURCE_COLORS} total={totalSources} />
        </div>
      )}

      {sortedPlatforms.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "16px", color: D.text }}>📺 Platform Breakdown</h3>
          <BarChart data={sortedPlatforms} colorMap={PLATFORM_BAR_COLORS} total={totalPlatforms} />
        </div>
      )}

      {sortedGenres.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "16px", color: D.text }}>🎭 Your Taste Profile</h3>
          <BarChart data={sortedGenres} total={totalGenres} />
        </div>
      )}

      {sorted.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "16px", color: D.text }}>👥 Your Recommendation Network</h3>
          {sorted.map(([name, data], index) => (
            <div key={name} style={{ padding: "14px", borderRadius: "12px", border: `1px solid ${D.border}`, marginBottom: "10px", background: index === 0 ? "#1c1a2e" : D.card2 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ fontWeight: "700", fontSize: "15px", color: D.text }}>{index === 0 ? "👑" : "👤"} {name}</div>
                <div style={{ fontSize: "12px", background: D.border, padding: "2px 10px", borderRadius: "20px", color: D.muted }}>{data.count} pick{data.count > 1 ? "s" : ""}</div>
              </div>
              <div style={{ background: D.border, borderRadius: "99px", height: "5px", marginBottom: "10px", overflow: "hidden" }}>
                <div style={{ width: `${(data.count / sorted[0][1].count) * 100}%`, height: "100%", borderRadius: "99px", background: index === 0 ? D.purple : D.accent }} />
              </div>
              {Object.keys(data.platforms).length > 0 && (
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {Object.entries(data.platforms).sort((a, b) => b[1] - a[1]).map(([platform, count]) => (
                    <span key={platform} style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px", background: PLATFORM_COLORS[platform]?.bg || D.card2, color: PLATFORM_COLORS[platform]?.color || D.text, border: `1px solid ${PLATFORM_COLORS[platform]?.border || D.border}` }}>
                      {platform} ×{count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [queue, setQueue] = useState([]);
  const [watched, setWatched] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [input, setInput] = useState("");
  const [recommender, setRecommender] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("discover");
  const [providers, setProviders] = useState({});
  const [modal, setModal] = useState(null);
  const [similarProviders, setSimilarProviders] = useState({});
  const [search, setSearch] = useState("");
  const [shareToast, setShareToast] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (user) loadQueue(); }, [user]);

  async function loadQueue() {
    const { data } = await supabase.from("queue").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) {
      setAllItems(data);
      setQueue(data.filter(i => !i.watched));
      setWatched(data.filter(i => i.watched));
      loadProviders(data);
    }
  }

  async function loadProviders(items) {
    const results = {};
    await Promise.all(items.map(async (item) => {
      if (item.tmdb_id && item.media_type) {
        const platforms = await fetchProviders(item.tmdb_id, item.media_type);
        results[item.id] = platforms;
      }
    }));
    setProviders(results);
  }

  async function addToQueue() {
    if (input === "") return;
    setLoading(true);
    let title = input;
    const source = detectUrlSource(input);
    if (input.startsWith("http")) {
      const res = await fetch("http://127.0.0.1:8000/extract", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input })
      });
      const data = await res.json();
      if (data.title && data.title !== "UNKNOWN") title = data.title;
    }
    const response = await fetch(`https://api.themoviedb.org/3/search/multi?query=${title}`, { headers: { Authorization: `Bearer ${TMDB_TOKEN}` } });
    const tmdbData = await response.json();
    const result = tmdbData.results[0];
    const genre = getGenre(result?.genre_ids);
    const item = {
      title: result?.title || result?.name || title,
      description: result?.overview || "No info found",
      poster: result?.poster_path ? `https://image.tmdb.org/t/p/w200${result.poster_path}` : null,
      recommender, watched: false, genre,
      tmdb_id: result?.id || null, media_type: result?.media_type || null,
      user_id: user.id, source,
    };
    await supabase.from("queue").insert([item]);
    await loadQueue();
    setInput(""); setRecommender(""); setLoading(false);
  }

  async function addDiscoveredToQueue(movie) {
    const genre = getGenre(movie.genre_ids);
    const item = {
      title: movie.title || movie.name,
      description: movie.overview || "No info found",
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : null,
      recommender: "Ripple", watched: false, genre,
      tmdb_id: movie.id, media_type: movie.media_type || "movie",
      user_id: user.id, source: "Discover",
    };
    await supabase.from("queue").insert([item]);
    await loadQueue();
  }

  async function deleteItem(id) {
    await supabase.from("queue").delete().eq("id", id);
    await loadQueue();
  }

  async function markWatched(item) {
    await supabase.from("queue").update({ watched: true }).eq("id", item.id);
    await loadQueue();
    if (item.tmdb_id && item.media_type) {
      const similar = await fetchSimilar(item.tmdb_id, item.media_type);
      const provResults = {};
      await Promise.all(similar.map(async (s) => {
        const platforms = await fetchProviders(s.id, item.media_type);
        provResults[s.id] = platforms;
      }));
      setSimilarProviders(provResults);
      setModal({ watchedTitle: item.title, similar, mediaType: item.media_type });
    }
  }

  async function markUnwatched(id) {
    await supabase.from("queue").update({ watched: false }).eq("id", id);
    await loadQueue();
  }

  async function addSimilarToQueue(s, mediaType) {
    const genre = getGenre(s.genre_ids);
    const item = {
      title: s.title || s.name, description: s.overview || "No info found",
      poster: s.poster_path ? `https://image.tmdb.org/t/p/w200${s.poster_path}` : null,
      recommender: "Ripple", watched: false, genre,
      tmdb_id: s.id, media_type: mediaType, user_id: user.id, source: "Ripple",
    };
    await supabase.from("queue").insert([item]);
    await loadQueue();
  }

  function shareItem(item) {
    const text = `You should watch "${item.title}" — added via Ripple 🎬`;
    const url = `https://ripple-app-ten.vercel.app`;
    const shareText = `${text}\n${url}`;
    if (navigator.share) {
      navigator.share({ title: item.title, text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      setShareToast(item.title);
      setTimeout(() => setShareToast(null), 3000);
    }
  }

  if (authLoading) {
    return <div style={{ minHeight: "100vh", background: D.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: D.muted }}>Loading...</div></div>;
  }

  if (!user) return <LoginScreen />;

  const activeList = tab === "queue" ? queue : watched;
  const filteredList = search
    ? activeList.filter(i => i.title?.toLowerCase().includes(search.toLowerCase()))
    : activeList;

  const grouped = filteredList.reduce((acc, item) => {
    const genre = item.genre || "Other";
    if (!acc[genre]) acc[genre] = [];
    acc[genre].push(item);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: "100vh", background: D.bg, display: "flex", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Sidebar tab={tab} setTab={setTab} queue={queue} watched={watched} user={user} />

      <div style={{ marginLeft: "220px", flex: 1, padding: "40px 80px" }}>

        {tab !== "discover" && tab !== "insights" && (
          <div style={{ maxWidth: "640px", margin: "0 auto 32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              <input placeholder="Paste a URL or type a title..." value={input} onChange={(e) => setInput(e.target.value)}
                style={{ padding: "14px 16px", borderRadius: "10px", border: `1px solid ${D.border}`, background: D.card, color: D.text, fontSize: "15px", outline: "none" }} />
              <input placeholder="Who recommended it? (e.g. Jake, TikTok)" value={recommender} onChange={(e) => setRecommender(e.target.value)}
                style={{ padding: "14px 16px", borderRadius: "10px", border: `1px solid ${D.border}`, background: D.card, color: D.text, fontSize: "15px", outline: "none" }} />
              <button onClick={addToQueue} style={{ padding: "14px", borderRadius: "10px", background: D.accent, color: "#fff", border: "none", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>
                {loading ? "Adding..." : "+ Add to Queue"}
              </button>
            </div>
            <input
              placeholder="Search your queue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 16px", borderRadius: "10px", border: `1px solid ${D.border}`, background: D.card2, color: D.text, fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
        )}

        {tab === "insights" && <InsightsTab allItems={allItems} providers={providers} queue={queue} watched={watched} />}
        {tab === "discover" && <DiscoverTab onAddToQueue={addDiscoveredToQueue} />}

        {(tab === "queue" || tab === "watched") && (
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            {Object.entries(grouped).length === 0 && search && (
              <div style={{ textAlign: "center", color: D.muted, padding: "40px 0" }}>No results for "{search}"</div>
            )}
            {Object.entries(grouped).map(([genre, items]) => (
              <div key={genre} style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "13px", fontWeight: "700", marginBottom: "12px", color: D.muted, textTransform: "uppercase", letterSpacing: "1px" }}>
                  {GENRE_EMOJI[genre] || "🎬"} {genre}
                </h2>
                {items.map((item) => {
                  const itemPlatforms = providers[item.id] || [];
                  const alreadyWatching = itemPlatforms.some(p => MY_PLATFORMS.includes(p));
                  const rippleScore = calcRippleScore(item, itemPlatforms);

                  return (
                    <div key={item.id} style={{ display: "flex", gap: "14px", padding: "16px", borderRadius: "12px", border: `1px solid ${alreadyWatching ? "#14532d" : D.border}`, marginBottom: "10px", alignItems: "flex-start", background: alreadyWatching ? "#0a1a0a" : D.card }}>
                      {item.poster && <img src={item.poster} alt={item.title} style={{ width: "56px", borderRadius: "6px", flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                          <div style={{ fontWeight: "700", fontSize: "15px", color: D.text }}>{item.title}</div>
                          {alreadyWatching && <span style={{ fontSize: "10px", background: "#14532d", color: D.green, padding: "1px 6px", borderRadius: "6px", fontWeight: "700", whiteSpace: "nowrap" }}>✓ You have it</span>}
                          <span style={{ fontSize: "10px", fontWeight: "800", color: getRippleScoreColor(rippleScore), marginLeft: "auto" }}>⚡{rippleScore}</span>
                        </div>
                        <div style={{ fontSize: "12px", color: D.muted, marginBottom: "6px", lineHeight: "1.4" }}>{item.description?.slice(0, 90)}...</div>
                        {item.recommender && item.recommender !== "Ripple" && <div style={{ fontSize: "11px", color: D.accent, marginBottom: "4px" }}>via {item.recommender}</div>}
                        {item.source && <div style={{ fontSize: "10px", color: D.muted, marginBottom: "6px" }}>from {item.source}</div>}
                        {itemPlatforms.length > 0 && (
                          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                            {itemPlatforms.map(platform => (
                              <span key={platform} style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "700", background: PLATFORM_COLORS[platform]?.bg || D.card2, color: PLATFORM_COLORS[platform]?.color || D.text, border: `1px solid ${PLATFORM_COLORS[platform]?.border || D.border}` }}>
                                {platform}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
                        {tab === "queue" ? (
                          <button onClick={() => markWatched(item)} style={{ padding: "7px 12px", borderRadius: "8px", background: "#0f2a1a", color: D.green, border: "1px solid #14532d", cursor: "pointer", fontSize: "12px", fontWeight: "700", whiteSpace: "nowrap" }}>✓ Watched</button>
                        ) : (
                          <button onClick={() => markUnwatched(item.id)} style={{ padding: "7px 12px", borderRadius: "8px", background: D.card2, color: D.muted, border: `1px solid ${D.border}`, cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap" }}>↩ Unwatch</button>
                        )}
                        <button onClick={() => shareItem(item)} style={{ padding: "7px 12px", borderRadius: "8px", background: D.card2, color: D.muted, border: `1px solid ${D.border}`, cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap" }}>↗ Share</button>
                        <button onClick={() => deleteItem(item.id)} style={{ padding: "7px 12px", borderRadius: "8px", background: "#1a0a0a", color: D.red, border: "1px solid #7f1d1d", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap" }}>✕ Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {shareToast && (
        <div style={{ position: "fixed", bottom: "32px", left: "50%", transform: "translateX(-50%)", background: D.card, border: `1px solid ${D.border}`, borderRadius: "10px", padding: "12px 20px", color: D.text, fontSize: "14px", zIndex: 2000, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
          ✓ Copied share link for <strong>{shareToast}</strong>
        </div>
      )}

      {modal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: D.card, borderRadius: "16px", padding: "28px", maxWidth: "500px", width: "90%", maxHeight: "80vh", overflowY: "auto", border: `1px solid ${D.border}` }}>
            <h2 style={{ fontSize: "18px", marginBottom: "4px", color: D.text }}>✅ Marked as Watched!</h2>
            <p style={{ color: D.muted, marginBottom: "20px", fontSize: "13px" }}>Since you watched <strong style={{ color: D.text }}>{modal.watchedTitle}</strong>, you might also like:</p>
            {modal.similar.map((s) => (
              <div key={s.id} style={{ display: "flex", gap: "12px", padding: "12px", borderRadius: "10px", border: `1px solid ${D.border}`, marginBottom: "10px", alignItems: "flex-start", background: D.card2 }}>
                {s.poster_path && <img src={`https://image.tmdb.org/t/p/w200${s.poster_path}`} alt={s.title || s.name} style={{ width: "46px", borderRadius: "6px" }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "700", fontSize: "14px", color: D.text }}>{s.title || s.name}</div>
                  <div style={{ fontSize: "11px", color: D.muted, margin: "3px 0" }}>{s.overview?.slice(0, 70)}...</div>
                  {similarProviders[s.id] && similarProviders[s.id].length > 0 && (
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                      {similarProviders[s.id].map(platform => (
                        <span key={platform} style={{ padding: "2px 7px", borderRadius: "6px", fontSize: "10px", fontWeight: "700", background: PLATFORM_COLORS[platform]?.bg || D.card2, color: PLATFORM_COLORS[platform]?.color || D.text, border: `1px solid ${PLATFORM_COLORS[platform]?.border || D.border}` }}>{platform}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => addSimilarToQueue(s, modal.mediaType)} style={{ padding: "6px 10px", borderRadius: "8px", background: D.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap", fontWeight: "700" }}>+ Add</button>
              </div>
            ))}
            <button onClick={() => setModal(null)} style={{ width: "100%", padding: "12px", borderRadius: "10px", background: D.card2, border: `1px solid ${D.border}`, cursor: "pointer", fontSize: "14px", color: D.muted, marginTop: "8px" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
