import { useState } from "react";

const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0YzgyNWRkYWNhYTM2ZDU3NjYwYzVlMDUyMzU5MzgyMyIsIm5iZiI6MTc3NDU5MjA4MS4zMjksInN1YiI6IjY5YzYyMDUxMzk2NDYxMWNkMTA4YTkyMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Q3gdXBGb7-dzla3lIT2raHJy8ZweNX0taKO2EWO-s4s";

function App() {
  const [queue, setQueue] = useState([]);
  const [input, setInput] = useState("");
  const [recommender, setRecommender] = useState("");
  const [loading, setLoading] = useState(false);

  async function addToQueue() {
    if (input === "") return;
    setLoading(true);

    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?query=${input}`,
      { headers: { Authorization: `Bearer ${TMDB_TOKEN}` } }
    );
    const data = await response.json();
    const result = data.results[0];

    if (result) {
      setQueue([...queue, {
        title: result.title || result.name,
        description: result.overview,
        poster: `https://image.tmdb.org/t/p/w200${result.poster_path}`,
        from: recommender
      }]);
    } else {
      setQueue([...queue, { title: input, description: "No info found", poster: null, from: recommender }]);
    }

    setInput("");
    setRecommender("");
    setLoading(false);
  }

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
          {loading ? "Searching..." : "Add to Queue"}
        </button>
      </div>

      {queue.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "16px", padding: "16px", borderRadius: "10px", border: "1px solid #eee", marginBottom: "12px" }}>
          {item.poster && <img src={item.poster} alt={item.title} style={{ width: "60px", borderRadius: "6px" }} />}
          <div>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>{item.title}</div>
            <div style={{ fontSize: "13px", color: "gray", margin: "4px 0" }}>{item.description?.slice(0, 100)}...</div>
            {item.from && <div style={{ fontSize: "12px", color: "#1A56DB" }}>via {item.from}</div>}
          </div>
        </div>
      ))}

    </div>
  );
}

export default App;