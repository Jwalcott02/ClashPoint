import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../client";

const Home = () => {
  const [debates, setDebates] = useState([]);
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("all");

  useEffect(() => {
    const fetchDebates = async () => {
      const { data, error } = await supabase
        .from('debates')
        .select('id, title, upvotes, created_at, repost_of');
      if (error) { console.error(error); return; }
      setDebates(data);
    };
    fetchDebates();
  }, []);

  const timeAgo = (ts) => {
    const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  const filtered = debates
    .filter(d => d.title.toLowerCase().includes(search.toLowerCase()))
    .filter(d => {
      if (view === "popular") return (d.upvotes ?? 0) > 0;
      return true;
    })
    .sort((a, b) => {
      if (view === "popular") return b.upvotes - a.upvotes;
      if (sort === "newest")  return new Date(b.created_at) - new Date(a.created_at);
      if (sort === "top")     return b.upvotes - a.upvotes;
      return 0;
    });

  const viewLabel = {
    all: "Home Feed",
    popular: "🔥 Popular — sorted by most upvoted",
    explore: "🔭 Explore — all debates",
  };

  return (
    <div className="reddit-layout">

      {/* ── Left Sidebar ── */}
      <aside className="left-sidebar">
        <div style={{ marginBottom: "18px", paddingBottom: "14px", borderBottom: "1px solid #2a2a35" }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "18px", fontWeight: 700, color: "#fff", margin: 0 }}>
            <span style={{ color: "#f03e3e" }}>Clash</span>Point
          </h2>
          <p style={{ fontSize: "12px", color: "#505060", margin: "4px 0 0", padding: 0 }}>
            A place where ideas collide
          </p>
        </div>
        <Link to="/" onClick={() => setView("all")}
          style={{ color: view === "all" ? "#f03e3e" : undefined }}>
          🏠 Home
        </Link>
        <Link to="/create">⚔️ Create Debate</Link>
        <p
          onClick={() => setView("popular")}
          style={{ cursor: "pointer", color: view === "popular" ? "#f03e3e" : undefined }}
        >
          🔥 Popular
        </p>
        <p
          onClick={() => setView("explore")}
          style={{ cursor: "pointer", color: view === "explore" ? "#f03e3e" : undefined }}
        >
          🔭 Explore
        </p>
      </aside>

      {/* ── Main Feed ── */}
      <main className="main-feed">

        {/* View label */}
        <p style={{ fontSize: "12px", color: "#505060", margin: "0 0 10px", fontFamily: "'DM Sans', sans-serif" }}>
          {viewLabel[view]}
        </p>

        {/* Search bar */}
        <input
          type="text"
          placeholder="🔍 Search debates..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", marginBottom: "12px",
            background: "#16161d", border: "1px solid #2a2a35",
            borderRadius: "8px", padding: "10px 14px",
            color: "#e2e2e8", fontSize: "14px",
            fontFamily: "'DM Sans', sans-serif",
            boxSizing: "border-box", outline: "none",
          }}
        />

        {/* Sort bar */}
        {view !== "popular" && (
          <div className="feed-header">
            <button className={sort === "newest" ? "active" : ""} onClick={() => setSort("newest")}>✨ Newest</button>
            <button className={sort === "top"    ? "active" : ""} onClick={() => setSort("top")}>📈 Top</button>
          </div>
        )}

        {filtered.length === 0 && (
          <p style={{ color: "#505060", fontSize: "14px", textAlign: "center", marginTop: "40px" }}>
            {search ? "No debates match your search." : view === "popular" ? "No upvoted debates yet." : "No debates yet. Create the first one!"}
          </p>
        )}

        {filtered.map((debate) => (
          <div key={debate.id} className="reddit-post">
            <div className="post-meta">
                <span className="category">⚔️ Debate</span>
                &nbsp;·&nbsp;{timeAgo(debate.created_at)}
                &nbsp;·&nbsp;<span className="post-id">ID: {debate.id}</span>
                {debate.repost_of && <span className="repost-badge">🔁 Repost</span>}
                </div>
            <h2>{debate.title}</h2>
            <div className="post-actions">
              <span className="vote-up">▲ {debate.upvotes ?? 0}</span>
              <Link to={`/debate/${debate.id}`}>💬 View Debate</Link>
            </div>
          </div>
        ))}
      </main>

      {/* ── Right Sidebar ── */}
      <aside className="right-sidebar">
        <div style={{ marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #2a2a35" }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "14px", fontWeight: 700, color: "#eeeef5", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "4px", height: "16px", background: "#f03e3e", borderRadius: "2px", display: "inline-block" }}></span>
            Popular Debates
          </h3>
        </div>
        {[...debates]
          .sort((a, b) => b.upvotes - a.upvotes)
          .slice(0, 5)
          .map(d => (
            <Link key={d.id} to={`/debate/${d.id}`} style={{
              display: "block", padding: "8px 12px", borderRadius: "7px",
              fontSize: "13px", color: "#c0c0d0", marginBottom: "4px",
              textDecoration: "none", transition: "background 0.12s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#1e1e2a"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              ▲ {d.upvotes ?? 0} · {d.title}
            </Link>
          ))
        }
      </aside>

    </div>
  );
};

export default Home;