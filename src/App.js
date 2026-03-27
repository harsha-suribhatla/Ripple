import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0YzgyNWRkYWNhYTM2ZDU3NjYwYzVlMDUyMzU5MzgyMyIsIm5iZiI6MTc3NDU5MjA4MS4zMjksInN1YiI6IjY5YzYyMDUxMzk2NDYxMWNkMTA4YTkyMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Q3gdXBGb7-dzla3lIT2raHJy8ZweNX0taKO2EWO-s4s";

const supabase = createClient(
  "https://ukqyhergomfqhzvqznjp.supabase.co",
  "sb_publishable_bDTEMEaJzcKE_LuIQGk_jA_zBEFhx0p"
);

function App() {
  const [queue, setQueue] = useState([]);
  const [watched, setWatched] = useState([]);
  const [input, setInput] = useState("");
  const [recommender, setRecommender] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("queue");

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
    }
  }

  async function addToQueue() {
    if (input === "") return;
    setLoading(true);

    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?query=${input}`,
      { headers: { Authorization: `Bearer ${TMDB_TOKEN}` } }
    );
    const data = await response.json();
    const result = data.results[0];

    const item = {
      title: result?.title || result?.name || input,
      description: result?.overview || "No info found",
      poster: result?.poster_path ? `https://image.tmdb.org/t/p/w200${result.poster_path}` : null,
      recommender: recommender,
      watched: false
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

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px", fontFamily: "sans-serif" }}>

      <h1 style={{ fontSize: "36px", marginBottom: "4px" }}>Ripple 🎬</h1>
      <p style={{ color: "gray", marginBottom: "24px" }}>Your social streaming queue</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "32px" }}>
        <input
          placeholder="Type a movie or show title..."
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

      {/* Tabs */}
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

      {activeList.map((item) => (
        <div key={item.id} style={{ display: "flex", gap: "16px", padding: "16px", borderRadius: "10px", border: "1px solid #eee", marginBottom: "12px", alignItems: "center" }}>
          {item.poster && <img src={item.poster} alt={item.title} style={{ width: "60px", borderRadius: "6px" }} />}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>{item.title}</div>
            <div style={{ fontSize: "13px", color: "gray", margin: "4px 0" }}>{item.description?.slice(0, 100)}...</div>
            {item.recommender && <div style={{ fontSize: "12px", color: "#1A56DB" }}>via {item.recommender}</div>}
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
  );
}

export default App;