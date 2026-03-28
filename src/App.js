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
  "Apple TV+": { bg: "#000", color: "#fff" },
  "Amazon Prime Video": { bg: "#00A8E1", color: "#fff" },
  "Paramount+": { bg: "#0064FF", color: "#fff" },
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

function App() {
  const [queue, setQueue] = useState([]);
  const [watched, setWatched] = useState([]);
  const [input, setInput] = useState("");
  const [recommender, setRecommender] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("queue");
  const [providers, setProviders] = useState({});

  useEffect(() => {
    loadQueue();
  }, []);

  async function loadQueue() {
    const { data } = await supabase
      .from("queue")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
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

  async function markWatched(id) {
    await supabase.from("queue").update({ watched: true }).eq("id", id);
    await loadQueue();
  }

  async function markUnwatched(id) {
    await supabase.from("queue").update({ watched: false }).eq("id", id);
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

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
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
      </div>

      {Object.entries(grouped).map(([genre, items]) => (
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
                  onClick={() => markWatched(item.id)}
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
      ))}

    </div>
  );
}

export default App;