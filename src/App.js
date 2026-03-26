import { useState } from "react";

function App() {
  const [queue, setQueue] = useState([]);
  const [input, setInput] = useState("");
  const [recommender, setRecommender] = useState("");

  function addToQueue() {
    if (input === "") return;
    setQueue([...queue, { title: input, from: recommender }]);
    setInput("");
    setRecommender("");
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px", fontFamily: "sans-serif" }}>

      <h1 style={{ fontSize: "36px", marginBottom: "4px" }}>Ripple 🎬</h1>
      <p style={{ color: "gray", marginBottom: "24px" }}>Your social streaming queue</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "32px" }}>
        <input
          placeholder="Paste a TikTok link or type a title..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px" }}
        />
        <input
          placeholder="Who recommended it? (e.g. Jake, TikTok, Instagram)"
          value={recommender}
          onChange={(e) => setRecommender(e.target.value)}
          style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px" }}
        />
        <button
          onClick={addToQueue}
          style={{ padding: "12px", borderRadius: "8px", background: "#1A56DB", color: "white", border: "none", fontSize: "16px", cursor: "pointer" }}
        >
          Add to Queue
        </button>
      </div>

      {queue.map((item, i) => (
        <div key={i} style={{ padding: "16px", borderRadius: "10px", border: "1px solid #eee", marginBottom: "12px" }}>
          <div style={{ fontSize: "16px", fontWeight: "bold" }}>🎬 {item.title}</div>
          {item.from && <div style={{ fontSize: "13px", color: "gray", marginTop: "4px" }}>via {item.from}</div>}
        </div>
      ))}

    </div>
  );
}

export default App;