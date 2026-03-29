/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const TMDB_TOKEN = process.env.REACT_APP_TMDB_TOKEN;

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

const D = {
  bg: "#0f0f0f",
  card: "#1a1a1a",
  card2: "#222",
  border: "#2a2a2a",
  text: "#fff",
  muted: "#888",
  accent: "#4f8ef7",
  accentDim: "#1a2a4a",
  green: "#22c55e",
  purple: "#a78bfa",
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
  "Action & Adventure": "💥",
  "Comedy": "😂",
  "Drama": "🎭",
  "Horror": "😱",
  "Sci-Fi & Fantasy": "🚀",
  "Mystery & Thriller": "🔍",
  "Romance": "💕",
  "Documentary": "🎥",
  "Animation": "✨",
  "Music": "🎵",
  "Other": "🎬",
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
  "Peacock": "#a78bfa",
  "Netflix": "#ef4444",
  "Max": "#60a5fa",
  "Hulu": "#22c55e",
  "Disney+": "#818cf8",
  "Apple TV+": "#e5e7eb",
  "Amazon Prime Video": "#38bdf8",
  "Paramount+": "#60a5fa",
};

const SOURCE_COLORS = {
  "TikTok": "#ff0050",
  "YouTube": "#FF0000",
  "Instagram": "#E1306C",
  "Twitter": "#1DA1F2",
  "Reddit": "#FF4500",
  "Snapchat": "#FFFC00",
  "Facebook": "#1877F2",
};

const PROVIDER_NAME_MAP = {
  8: "Netflix",
  9: "Amazon Prime Video",
  15: "Hulu",
  337: "Disney+",
  384: "Max",
  386: "Peacock",
  387: "Peacock",
  389: "Peacock",
  531: "Paramount+",
  350: "Apple TV+",
};

const SOURCE_PLATFORMS = ["tiktok", "youtube", "instagram", "twitter", "reddit", "snapchat", "facebook"];

function detectSource(recommender) {
  if (!recommender) return null;
  const lower = recommender.toLowerCase();
  for (let s of SOURCE_PLATFORMS) {
    if (lower.includes(s)) return s.charAt(0).toUpperCase() + s.slice(1);
  }
  return null;
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
    if (name && !seen.has(name)) {
      seen.add(name);
      platforms.push(name);
    }
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
      options: {
        redirectTo: window.location.origin
      }
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
        <button
          onClick={handleLogin}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
            width: "100%", padding: "14px 24px",
            background: "#fff", color: "#111",
            border: "none", borderRadius: "12px",
            fontSize: "16px", fontWeight: "700",
            cursor: "pointer",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        <p style={{ color: D.muted, fontSize: "12px", marginTop: "20px" }}>
          Your queue is private and only visible to you.
        </p>
      </div>
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
            <div style={{
              width: `${(count / total) * 100}%`,
              height: "100%",
              borderRadius: "99px",
              background: colorMap?.[name] || D.accent,
              transition: "width 0.5s ease"
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightsTab({ allItems, providers, queue, watched }) {
  const peopleMap = {};
  const sourceCounts = {};
  const platformCounts = {};
  const genreCounts = {};

  for (let item of allItems) {
    if (item.genre) genreCounts[item.genre] = (genreCounts[item.genre] || 0) + 1;
    if (!item.recommender || item.recommender === "Ripple") continue;
    const name = item.recommender;
    if (!peopleMap[name]) peopleMap[name] = { count: 0, sources: {}, platforms: {} };
    peopleMap[name].count++;
    const source = detectSource(name);
    if (source) {
      peopleMap[name].sources[source] = (peopleMap[name].sources[source] || 0) + 1;
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    }
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

  const sectionStyle = {
    background: D.card, borderRadius: "14px", padding: "20px",
    border: `1px solid ${D.border}`, marginBottom: "14px",
  };

  return (
    <div>
      <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "4px", color: D.text }}>📊 Ripple Insights</h2>
      <p style={{ color: D.muted, fontSize: "13px", marginBottom: "20px" }}>Your personal streaming intelligence</p>

      <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
        <StatCard emoji="🎬" label="In Queue" value={queue.length} color={D.accent} />
        <StatCard emoji="✅" label="Watched" value={watched.length} color={D.green} />
        {topRecommender && <StatCard emoji="👑" label="Top Recommender" value={topRecommender[0]} sub={`${topRecommender[1].count} picks`} color={D.purple} />}
        {topPlatform && <StatCard emoji="📺" label="Top Platform" value={topPlatform[0]} sub={`${topPlatform[1]} titles`} color="#f59e0b" />}
      </div>

      {sortedPlatforms.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "16px", color: D.text }}>📺 Platform Breakdown</h3>
          <BarChart data={sortedPlatforms} colorMap={PLATFORM_BAR_COLORS} total={totalPlatforms} />
        </div>
      )}

      {sortedSources.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "16px", color: D.text }}>📱 Where You Discover</h3>
          <BarChart data={sortedSources} colorMap={SOURCE_COLORS} total={totalSources} />
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
                <div style={{ fontWeight: "700", fontSize: "15px", color: D.text }}>
                  {index === 0 ? "👑" : "👤"} {name}
                </div>
                <div style={{ fontSize: "12px", background: D.border, padding: "2px 10px", borderRadius: "20px", color: D.muted }}>
                  {data.count} pick{data.count > 1 ? "s" : ""}
                </div>
              </div>
              <div style={{ background: D.border, borderRadius: "99px", height: "5px", marginBottom: "10px", overflow: "hidden" }}>
                <div style={{ width: `${(data.count / sorted[0][1].count) * 100}%`, height: "100%", borderRadius: "99px", background: index === 0 ? D.purple : D.accent }} />
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {Object.entries(data.sources).map(([src]) => (
                  <span key={src} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "10px", background: SOURCE_COLORS[src] || D.accentDim, color: src === "Snapchat" ? "#000" : "#fff", fontWeight: "600" }}>
                    📱 {src}
                  </span>
                ))}
                {Object.entries(data.platforms).sort((a, b) => b[1] - a[1]).map(([platform, count]) => (
                  <span key={platform} style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px", background: PLATFORM_COLORS[platform]?.bg || D.card2, color: PLATFORM_COLORS[platform]?.color || D.text, border: `1px solid ${PLATFORM_COLORS[platform]?.border || D.border}` }}>
                    {platform} ×{count}
                  </span>
                ))}
              </div>
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
  const [tab, setTab] = useState("queue");
  const [providers, setProviders] = useState({});
  const [modal, setModal] = useState(null);
  const [similarProviders, setSimilarProviders] = useState({});

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

  useEffect(() => {
    if (user) loadQueue();
  }, [user]);

  async function loadQueue() {
    const { data } = await supabase
      .from("queue")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
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
    if (input.startsWith("http")) {
      const res = await fetch("http://127.0.0.1:8000/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input })
      });
      const data = await res.json();
      if (data.title && data.title !== "UNKNOWN") title = data.title;
    }
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?query=${title}`,
      { headers: { Authorization: `Bearer ${TMDB_TOKEN}` } }
    );
    const tmdbData = await response.json();
    const result = tmdbData.results[0];
    const genre = getGenre(result?.genre_ids);
    const item = {
      title: result?.title || result?.name || title,
      description: result?.overview || "No info found",
      poster: result?.poster_path ? `https://image.tmdb.org/t/p/w200${result.poster_path}` : null,
      recommender,
      watched: false,
      genre,
      tmdb_id: result?.id || null,
      media_type: result?.media_type || null,
      user_id: user.id,
    };
    await supabase.from("queue").insert([item]);
    await loadQueue();
    setInput("");
    setRecommender("");
    setLoading(false);
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
      title: s.title || s.name,
      description: s.overview || "No info found",
      poster: s.poster_path ? `https://image.tmdb.org/t/p/w200${s.poster_path}` : null,
      recommender: "Ripple",
      watched: false,
      genre,
      tmdb_id: s.id,
      media_type: mediaType,
      user_id: user.id,
    };
    await supabase.from("queue").insert([item]);
    await loadQueue();
  }

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: D.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: D.muted, fontSize: "16px" }}>Loading...</div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  const activeList = tab === "queue" ? queue : watched;
  const grouped = activeList.reduce((acc, item) => {
    const genre = item.genre || "Other";
    if (!acc[genre]) acc[genre] = [];
    acc[genre].push(item);
    return acc;
  }, {});

  const tabBtn = (id, label) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding: "8px 20px", borderRadius: "20px", border: "none", cursor: "pointer",
        background: tab === id ? D.accent : D.card,
        color: tab === id ? "#fff" : D.muted,
        fontWeight: "bold", fontSize: "14px",
      }}
    >{label}</button>
  );

  return (
    <div style={{ minHeight: "100vh", background: D.bg }}>
      <div style={{ maxWidth: "620px", margin: "0 auto", padding: "40px 20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "900", color: D.text, marginBottom: "4px", letterSpacing: "-0.5px" }}>Ripple 🎬</h1>
            <p style={{ color: D.muted, fontSize: "14px" }}>Hey {user.user_metadata?.full_name?.split(" ")[0] || "there"} 👋</p>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ padding: "8px 16px", borderRadius: "10px", background: D.card, border: `1px solid ${D.border}`, color: D.muted, cursor: "pointer", fontSize: "13px" }}
          >Sign out</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
          <input
            placeholder="Paste a URL or type a title..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ padding: "14px 16px", borderRadius: "10px", border: `1px solid ${D.border}`, background: D.card, color: D.text, fontSize: "15px", outline: "none" }}
          />
          <input
            placeholder="Who recommended it? (e.g. Jake, TikTok)"
            value={recommender}
            onChange={(e) => setRecommender(e.target.value)}
            style={{ padding: "14px 16px", borderRadius: "10px", border: `1px solid ${D.border}`, background: D.card, color: D.text, fontSize: "15px", outline: "none" }}
          />
          <button
            onClick={addToQueue}
            style={{ padding: "14px", borderRadius: "10px", background: D.accent, color: "#fff", border: "none", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}
          >
            {loading ? "Adding..." : "+ Add to Queue"}
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          {tabBtn("queue", `Queue (${queue.length})`)}
          {tabBtn("watched", `Watched (${watched.length})`)}
          {tabBtn("insights", "📊 Insights")}
        </div>

        {tab === "insights" ? (
          <InsightsTab allItems={allItems} providers={providers} queue={queue} watched={watched} />
        ) : (
          Object.entries(grouped).map(([genre, items]) => (
            <div key={genre} style={{ marginBottom: "32px" }}>
              <h2 style={{ fontSize: "13px", fontWeight: "700", marginBottom: "12px", color: D.muted, textTransform: "uppercase", letterSpacing: "1px" }}>
                {GENRE_EMOJI[genre] || "🎬"} {genre}
              </h2>
              {items.map((item) => (
                <div key={item.id} style={{ display: "flex", gap: "14px", padding: "16px", borderRadius: "12px", border: `1px solid ${D.border}`, marginBottom: "10px", alignItems: "flex-start", background: D.card }}>
                  {item.poster && <img src={item.poster} alt={item.title} style={{ width: "56px", borderRadius: "6px", flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: "700", fontSize: "15px", color: D.text, marginBottom: "3px" }}>{item.title}</div>
                    <div style={{ fontSize: "12px", color: D.muted, marginBottom: "6px", lineHeight: "1.4" }}>{item.description?.slice(0, 90)}...</div>
                    {item.recommender && <div style={{ fontSize: "11px", color: D.accent, marginBottom: "6px" }}>via {item.recommender}</div>}
                    {providers[item.id] && providers[item.id].length > 0 && (
                      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                        {providers[item.id].map(platform => (
                          <span key={platform} style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "700", background: PLATFORM_COLORS[platform]?.bg || D.card2, color: PLATFORM_COLORS[platform]?.color || D.text, border: `1px solid ${PLATFORM_COLORS[platform]?.border || D.border}` }}>
                            {platform}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {tab === "queue" ? (
                    <button onClick={() => markWatched(item)} style={{ padding: "7px 12px", borderRadius: "8px", background: "#0f2a1a", color: D.green, border: "1px solid #14532d", cursor: "pointer", fontSize: "12px", fontWeight: "700", whiteSpace: "nowrap", flexShrink: 0 }}>
                      ✓ Watched
                    </button>
                  ) : (
                    <button onClick={() => markUnwatched(item.id)} style={{ padding: "7px 12px", borderRadius: "8px", background: D.card2, color: D.muted, border: `1px solid ${D.border}`, cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap", flexShrink: 0 }}>
                      ↩ Unwatch
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))
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
                          <span key={platform} style={{ padding: "2px 7px", borderRadius: "6px", fontSize: "10px", fontWeight: "700", background: PLATFORM_COLORS[platform]?.bg || D.card2, color: PLATFORM_COLORS[platform]?.color || D.text, border: `1px solid ${PLATFORM_COLORS[platform]?.border || D.border}` }}>
                            {platform}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => addSimilarToQueue(s, modal.mediaType)} style={{ padding: "6px 10px", borderRadius: "8px", background: D.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap", fontWeight: "700" }}>
                    + Add
                  </button>
                </div>
              ))}
              <button onClick={() => setModal(null)} style={{ width: "100%", padding: "12px", borderRadius: "10px", background: D.card2, border: `1px solid ${D.border}`, cursor: "pointer", fontSize: "14px", color: D.muted, marginTop: "8px" }}>
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;