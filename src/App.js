/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const TMDB_TOKEN = process.env.REACT_APP_TMDB_TOKEN;

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

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
  "Peacock": { bg: "#000", color: "#fff" },
  "Netflix": { bg: "#E50914", color: "#fff" },
  "Max": { bg: "#002BE7", color: "#fff" },
  "Hulu": { bg: "#1CE783", color: "#000" },
  "Disney+": { bg: "#113CCF", color: "#fff" },
  "Apple TV+": { bg: "#555", color: "#fff" },
  "Amazon Prime Video": { bg: "#00A8E1", color: "#fff" },
  "Paramount+": { bg: "#0064FF", color: "#fff" },
};

const PLATFORM_BAR_COLORS = {
  "Peacock": "#6366f1",
  "Netflix": "#E50914",
  "Max": "#002BE7",
  "Hulu": "#1CE783",
  "Disney+": "#113CCF",
  "Apple TV+": "#555",
  "Amazon Prime Video": "#00A8E1",
  "Paramount+": "#0064FF",
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

function StatCard({ emoji, label, value, sub, color }) {
  return (
    <div style={{ flex: 1, minWidth: "120px", background: "#fff", borderRadius: "14px", padding: "16px", border: "1px solid #eee", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <div style={{ fontSize: "22px", marginBottom: "6px" }}>{emoji}</div>
      <div style={{ fontSize: "11px", color: "gray", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "22px", fontWeight: "800", color: color || "#111" }}>{value}</div>
      {sub && <div style={{ fontSize: "11px", color: "gray", marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

function BarChart({ data, colorMap, total }) {
  if (!data || data.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {data.map(([name, count]) => (
        <div key={name}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "3px" }}>
            <span style={{ fontWeight: "600" }}>{name}</span>
            <span style={{ color: "gray" }}>{count} ({Math.round((count / total) * 100)}%)</span>
          </div>
          <div style={{ background: "#f1f1f1", borderRadius: "99px", height: "8px", overflow: "hidden" }}>
            <div style={{
              width: `${(count / total) * 100}%`,
              height: "100%",
              borderRadius: "99px",
              background: colorMap?.[name] || "#1A56DB",
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
    if (item.genre) {
      genreCounts[item.genre] = (genreCounts[item.genre] || 0) + 1;
    }

    if (!item.recommender || item.recommender === "Ripple") continue;
    const name = item.recommender;
    if (!peopleMap[name]) {
      peopleMap[name] = { count: 0, sources: {}, platforms: {} };
    }
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

  if (allItems.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "gray", padding: "40px 0" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>📊</div>
        <p>Add some titles to see your insights!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "4px" }}>📊 Ripple Insights</h2>
      <p style={{ color: "gray", fontSize: "13px", marginBottom: "20px" }}>Your personal streaming intelligence</p>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
        <StatCard emoji="🎬" label="In Queue" value={queue.length} color="#1A56DB" />
        <StatCard emoji="✅" label="Watched" value={watched.length} color="#065F46" />
        {topRecommender && <StatCard emoji="👑" label="Top Recommender" value={topRecommender[0]} sub={`${topRecommender[1].count} picks`} color="#7C3AED" />}
        {topPlatform && <StatCard emoji="📺" label="Top Platform" value={topPlatform[0]} sub={`${topPlatform[1]} titles`} color="#B45309" />}
      </div>

      {/* Platform Breakdown */}
      {sortedPlatforms.length > 0 && (
        <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", border: "1px solid #eee", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px" }}>📺 Platform Breakdown</h3>
          <BarChart data={sortedPlatforms} colorMap={PLATFORM_BAR_COLORS} total={totalPlatforms} />
        </div>
      )}

      {/* Source Breakdown */}
      {sortedSources.length > 0 && (
        <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", border: "1px solid #eee", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px" }}>📱 Where You Discover</h3>
          <BarChart data={sortedSources} colorMap={SOURCE_COLORS} total={totalSources} />
        </div>
      )}

      {/* Genre Breakdown */}
      {sortedGenres.length > 0 && (
        <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", border: "1px solid #eee", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px" }}>🎭 Your Taste Profile</h3>
          <BarChart data={sortedGenres} total={totalGenres} />
        </div>
      )}

      {/* Recommender Cards */}
      {sorted.length > 0 && (
        <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", border: "1px solid #eee", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px" }}>👥 Your Recommendation Network</h3>
          {sorted.map(([name, data], index) => (
            <div key={name} style={{ padding: "14px", borderRadius: "12px", border: "1px solid #f1f1f1", marginBottom: "10px", background: index === 0 ? "#fdfaff" : "#fafafa" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ fontWeight: "700", fontSize: "15px" }}>
                  {index === 0 ? "👑" : "👤"} {name}
                </div>
                <div style={{ fontSize: "12px", background: "#f1f1f1", padding: "2px 10px", borderRadius: "20px", color: "#333" }}>
                  {data.count} pick{data.count > 1 ? "s" : ""}
                </div>
              </div>

              {/* Progress bar relative to top recommender */}
              <div style={{ background: "#f1f1f1", borderRadius: "99px", height: "6px", marginBottom: "10px", overflow: "hidden" }}>
                <div style={{
                  width: `${(data.count / sorted[0][1].count) * 100}%`,
                  height: "100%",
                  borderRadius: "99px",
                  background: index === 0 ? "#7C3AED" : "#1A56DB"
                }} />
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {Object.keys(data.sources).length > 0 && Object.entries(data.sources).map(([src]) => (
                  <span key={src} style={{
                    fontSize: "11px", padding: "2px 8px", borderRadius: "10px",
                    background: SOURCE_COLORS[src] || "#e0e7ff",
                    color: src === "Snapchat" ? "#000" : "#fff",
                    fontWeight: "600"
                  }}>
                    📱 {src}
                  </span>
                ))}
                {Object.entries(data.platforms).sort((a, b) => b[1] - a[1]).map(([platform, count]) => (
                  <span key={platform} style={{
                    fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px",
                    background: PLATFORM_COLORS[platform]?.bg || "#333",
                    color: PLATFORM_COLORS[platform]?.color || "#fff"
                  }}>
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
    loadQueue();
  }, []);

  async function loadQueue() {
    const { data } = await supabase
      .from("queue")
      .select("*")
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
      if (data.title && data.title !== "UNKNOWN") {
        title = data.title;
      }
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
      recommender: recommender,
      watched: false,
      genre: genre,
      tmdb_id: result?.id || null,
      media_type: result?.media_type || null,
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
      genre: genre,
      tmdb_id: s.id,
      media_type: mediaType,
    };
    await supabase.from("queue").insert([item]);
    await loadQueue();
  }

  const activeList = tab === "queue" ? queue : watched;

  const grouped = activeList.reduce((acc, item) => {
    const genre = item.genre || "Other";
    if (!acc[genre]) acc[genre] = [];
    acc[genre].push(item);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px", fontFamily: "sans-serif" }}>

      <h1 style={{ fontSize: "36px", marginBottom: "4px" }}>Ripple 🎬</h1>
      <p style={{ color: "gray", marginBottom: "24px" }}>Your social streaming queue</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "32px" }}>
        <input
          placeholder="Paste a URL or type a title..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px" }}
        />
        <input
          placeholder="Who recommended it? (e.g. Jake, TikTok)"
          value={recommender}
          onChange={(e) => setRecommender(e.target.value)}
          style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px" }}
        />
        <button
          onClick={addToQueue}
          style={{ padding: "12px", borderRadius: "8px", background: "#1A56DB", color: "white", border: "none", fontSize: "16px", cursor: "pointer" }}
        >
          {loading ? "Adding..." : "Add to Queue"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button
          onClick={() => setTab("queue")}
          style={{ padding: "8px 20px", borderRadius: "20px", border: "none", cursor: "pointer", background: tab === "queue" ? "#1A56DB" : "#f1f1f1", color: tab === "queue" ? "white" : "black", fontWeight: "bold" }}
        >
          Queue ({queue.length})
        </button>
        <button
          onClick={() => setTab("watched")}
          style={{ padding: "8px 20px", borderRadius: "20px", border: "none", cursor: "pointer", background: tab === "watched" ? "#1A56DB" : "#f1f1f1", color: tab === "watched" ? "white" : "black", fontWeight: "bold" }}
        >
          Watched ({watched.length})
        </button>
        <button
          onClick={() => setTab("insights")}
          style={{ padding: "8px 20px", borderRadius: "20px", border: "none", cursor: "pointer", background: tab === "insights" ? "#1A56DB" : "#f1f1f1", color: tab === "insights" ? "white" : "black", fontWeight: "bold" }}
        >
          📊 Insights
        </button>
      </div>

      {tab === "insights" ? (
        <InsightsTab allItems={allItems} providers={providers} queue={queue} watched={watched} />
      ) : (
        Object.entries(grouped).map(([genre, items]) => (
          <div key={genre} style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "12px", color: "#111" }}>
              {GENRE_EMOJI[genre] || "🎬"} {genre}
            </h2>
            {items.map((item) => (
              <div key={item.id} style={{ display: "flex", gap: "16px", padding: "16px", borderRadius: "10px", border: "1px solid #eee", marginBottom: "12px", alignItems: "flex-start" }}>
                {item.poster && <img src={item.poster} alt={item.title} style={{ width: "60px", borderRadius: "6px" }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>{item.title}</div>
                  <div style={{ fontSize: "13px", color: "gray", margin: "4px 0" }}>{item.description?.slice(0, 100)}...</div>
                  {item.recommender && <div style={{ fontSize: "12px", color: "#1A56DB", marginBottom: "6px" }}>via {item.recommender}</div>}
                  {providers[item.id] && providers[item.id].length > 0 && (
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {providers[item.id].map(platform => (
                        <span key={platform} style={{
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "bold",
                          background: PLATFORM_COLORS[platform]?.bg || "#333",
                          color: PLATFORM_COLORS[platform]?.color || "#fff"
                        }}>
                          {platform}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {tab === "queue" ? (
                  <button
                    onClick={() => markWatched(item)}
                    style={{ padding: "8px 12px", borderRadius: "8px", background: "#ECFDF5", color: "#065F46", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "bold", whiteSpace: "nowrap" }}
                  >
                    ✓ Watched
                  </button>
                ) : (
                  <button
                    onClick={() => markUnwatched(item.id)}
                    style={{ padding: "8px 12px", borderRadius: "8px", background: "#f1f1f1", color: "gray", border: "none", cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap" }}
                  >
                    ↩ Unwatch
                  </button>
                )}
              </div>
            ))}
          </div>
        ))
      )}

      {modal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "32px", maxWidth: "500px", width: "90%", maxHeight: "80vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>✅ Marked as Watched!</h2>
            <p style={{ color: "gray", marginBottom: "20px", fontSize: "14px" }}>Since you watched <strong>{modal.watchedTitle}</strong>, you might also like:</p>

            {modal.similar.map((s) => (
              <div key={s.id} style={{ display: "flex", gap: "12px", padding: "12px", borderRadius: "10px", border: "1px solid #eee", marginBottom: "12px", alignItems: "flex-start" }}>
                {s.poster_path && <img src={`https://image.tmdb.org/t/p/w200${s.poster_path}`} alt={s.title || s.name} style={{ width: "50px", borderRadius: "6px" }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", fontSize: "15px" }}>{s.title || s.name}</div>
                  <div style={{ fontSize: "12px", color: "gray", margin: "4px 0" }}>{s.overview?.slice(0, 80)}...</div>
                  {similarProviders[s.id] && similarProviders[s.id].length > 0 && (
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                      {similarProviders[s.id].map(platform => (
                        <span key={platform} style={{
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "10px",
                          fontWeight: "bold",
                          background: PLATFORM_COLORS[platform]?.bg || "#333",
                          color: PLATFORM_COLORS[platform]?.color || "#fff"
                        }}>
                          {platform}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => addSimilarToQueue(s, modal.mediaType)}
                  style={{ padding: "6px 10px", borderRadius: "8px", background: "#1A56DB", color: "white", border: "none", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap" }}
                >
                  + Add
                </button>
              </div>
            ))}

            <button
              onClick={() => setModal(null)}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "#f1f1f1", border: "none", cursor: "pointer", fontSize: "15px", marginTop: "8px" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;