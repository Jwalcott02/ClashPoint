import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../client";

const DebateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [debate, setDebate] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [originalPost, setOriginalPost] = useState(null);
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('debates').select().eq('id', id).single();
      if (error) { console.error(error); return; }
      setDebate(data);
      if (data.repost_of) fetchOriginalPost(data.repost_of);
    };
    load();
  }, [id]);

  const fetchOriginalPost = async (originalId) => {
    const { data, error } = await supabase
      .from('debates').select('id, title, description, created_at, upvotes').eq('id', originalId).single();
    if (error) { console.error(error); return; }
    setOriginalPost(data);
  };

  const handleUpvote = async () => {
    const newCount = (debate.upvotes ?? 0) + 1;
    const { error } = await supabase
      .from('debates').update({ upvotes: newCount }).eq('id', id);
    if (!error) setDebate(prev => ({ ...prev, upvotes: newCount }));
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);

    const existingComments = Array.isArray(debate.comments) ? debate.comments : [];
    const updatedComments = [
      ...existingComments,
      { content: newComment.trim(), created_at: new Date().toISOString() }
    ];

    const { error } = await supabase
      .from('debates')
      .update({ comments: updatedComments })
      .eq('id', id);

    if (!error) {
      setDebate(prev => ({ ...prev, comments: updatedComments }));
      setNewComment("");
    } else {
      console.error(error);
    }
    setSubmitting(false);
  };

  const requestAction = (action) => {
    setPendingAction(action);
    setKeyInput("");
    setKeyError("");
    setShowKeyModal(true);
  };

  const confirmAction = async () => {
    if (keyInput !== debate.secret_key) {
      setKeyError("Incorrect secret key. Try again.");
      return;
    }
    setShowKeyModal(false);
    if (pendingAction === 'delete') {
      await supabase.from('debates').delete().eq('id', id);
      navigate("/");
    }
    if (pendingAction === 'edit') {
      navigate(`/debate/${id}/edit`, { state: { authorized: true } });
    }
  };

  const timeAgo = (ts) => {
    const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  const generateSummary = async () => {
    setLoadingSummary(true);
    setSummary("");

    const commentText = comments.length > 0
      ? comments.map(c => `- ${c.content}`).join("\n")
      : "No comments yet.";

    const prompt = `Here is a debate post:
Title: ${debate.title}
Description: ${debate.description || "No description."}
Upvotes: ${debate.upvotes ?? 0}
Comments (${comments.length}):
${commentText}

Write a short 2-3 sentence summary of this debate. Mention what it's about, how popular it is based on upvotes, and what the general sentiment is in the comments.`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 300,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      console.log("Groq response:", JSON.stringify(data));

      if (data.choices && data.choices[0]) {
        setSummary(data.choices[0].message.content);
      } else if (data.error) {
        setSummary(`Error: ${data.error.message}`);
      } else {
        setSummary("Could not generate summary. Please try again.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setSummary("Could not connect to AI. Please try again.");
    }

    setLoadingSummary(false);
  };

  if (!debate) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <p style={{ color: "#505060", fontFamily: "'DM Sans', sans-serif" }}>Loading debate...</p>
    </div>
  );

  const comments = Array.isArray(debate.comments) ? debate.comments : [];

  return (
    <div style={{ maxWidth: "740px", margin: "32px auto", padding: "0 20px" }}>

      <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#7878a0", fontSize: "13px", fontWeight: 600, textDecoration: "none", marginBottom: "20px", fontFamily: "'DM Sans', sans-serif" }}>
        ← Back to Feed
      </Link>

      {/* Main post card */}
      <div style={{ background: "#16161d", border: "1px solid #2a2a35", borderRadius: "12px", overflow: "hidden", marginBottom: "20px" }}>
        {debate.image_url && (
          <img src={debate.image_url} alt={debate.title} style={{ width: "100%", maxHeight: "420px", objectFit: "cover", display: "block" }} />
        )}
        <div style={{ padding: "24px 28px" }}>
          <div style={{ fontSize: "12px", color: "#505060", marginBottom: "10px", fontFamily: "'DM Sans', sans-serif" }}>
            <span style={{ color: "#f03e3e", fontWeight: 600 }}>⚔️ Debate</span>
            &nbsp;·&nbsp;{timeAgo(debate.created_at)}
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "24px", fontWeight: 700, color: "#eeeef5", margin: "0 0 14px", lineHeight: 1.3 }}>
            {debate.title}
          </h1>
          {debate.description && (
            <p style={{ color: "#9090b0", fontSize: "15px", lineHeight: 1.7, margin: "0 0 24px", fontFamily: "'DM Sans', sans-serif" }}>
              {debate.description}
            </p>
          )}

          {/* Original post reference */}
          {originalPost && (
            <div className="original-post-card">
              <p style={{ fontSize: "11px", color: "#505060", margin: "0 0 6px", fontFamily: "'DM Sans', sans-serif" }}>
                🔁 Reposted from
              </p>
              <Link to={`/debate/${originalPost.id}`} style={{ textDecoration: "none" }}>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", fontWeight: 600, color: "#4dabf7", margin: "0 0 6px", lineHeight: 1.3 }}>
                  {originalPost.title}
                </h3>
              </Link>
              {originalPost.description && (
                <p style={{ fontSize: "13px", color: "#7878a0", margin: "0 0 8px", lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                  {originalPost.description.length > 120 ? originalPost.description.slice(0, 120) + "..." : originalPost.description}
                </p>
              )}
              <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#505060", fontFamily: "'DM Sans', sans-serif" }}>
                <span>▲ {originalPost.upvotes ?? 0}</span>
                <span>Post #{originalPost.id}</span>
              </div>
            </div>
          )}

          <div style={{ borderTop: "1px solid #2a2a35", paddingTop: "18px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={handleUpvote} style={{
              background: "#1e1e2a", border: "1px solid #2a2a35", borderRadius: "7px",
              padding: "8px 18px", color: "#f03e3e", fontSize: "13px", fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
            }}>
              ▲ Upvote
            </button>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "18px", fontWeight: 700, color: "#eeeef5", minWidth: "32px", textAlign: "center" }}>
              {debate.upvotes ?? 0}
            </span>
            <button onClick={() => requestAction('edit')} style={{
              marginLeft: "auto", background: "transparent", border: "1px solid #2a2a35",
              borderRadius: "7px", padding: "8px 16px", color: "#7878a0",
              fontSize: "13px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
            }}>
              ✏️ Edit
            </button>
            <button onClick={() => requestAction('delete')} style={{
              background: "transparent", border: "1px solid #f03e3e44",
              borderRadius: "7px", padding: "8px 16px", color: "#f03e3e",
              fontSize: "13px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
            }}>
              🗑 Delete
            </button>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div style={{ background: "#16161d", border: "1px solid #2a2a35", borderRadius: "12px", padding: "24px 28px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: summary ? "16px" : "0" }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "16px", fontWeight: 700, color: "#eeeef5", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "4px", height: "18px", background: "#4dabf7", borderRadius: "2px", display: "inline-block" }}></span>
            AI Summary
          </h2>
          <button onClick={generateSummary} disabled={loadingSummary} style={{
            background: loadingSummary ? "#1e1e2a" : "#4dabf7",
            color: loadingSummary ? "#505060" : "#fff",
            border: "none", borderRadius: "7px", padding: "7px 16px",
            fontSize: "13px", fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            cursor: loadingSummary ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}>
            {loadingSummary ? "Generating..." : "✨ Generate Summary"}
          </button>
        </div>
        {summary && (
          <p style={{ color: "#c0c0d0", fontSize: "14px", lineHeight: 1.7, margin: 0, fontFamily: "'DM Sans', sans-serif", background: "#0f0f13", padding: "14px 16px", borderRadius: "8px", border: "1px solid #2a2a35" }}>
            {summary}
          </p>
        )}
      </div>

      {/* Comments section */}
      <div style={{ background: "#16161d", border: "1px solid #2a2a35", borderRadius: "12px", padding: "24px 28px" }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "16px", fontWeight: 700, color: "#eeeef5", margin: "0 0 18px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "4px", height: "18px", background: "#f03e3e", borderRadius: "2px", display: "inline-block" }}></span>
          {comments.length} Comment{comments.length !== 1 ? "s" : ""}
        </h2>

        <form onSubmit={handleComment} style={{ marginBottom: "24px" }}>
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Share your take..."
            rows={3}
            style={{
              width: "100%", background: "#0f0f13", border: "1px solid #2a2a35",
              borderRadius: "7px", padding: "10px 14px", color: "#e2e2e8",
              fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
              resize: "vertical", boxSizing: "border-box", outline: "none", marginBottom: "8px",
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" disabled={submitting || !newComment.trim()} style={{
              background: newComment.trim() ? "#f03e3e" : "#2a2a35",
              color: newComment.trim() ? "#fff" : "#505060",
              border: "none", borderRadius: "7px", padding: "8px 20px",
              fontSize: "13px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              cursor: newComment.trim() ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}>
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>

        {comments.length === 0 ? (
          <p style={{ color: "#505060", fontSize: "14px", textAlign: "center", padding: "20px 0" }}>
            No comments yet. Be the first to weigh in!
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {comments.map((c, i) => (
              <div key={i} style={{
                background: "#0f0f13", border: "1px solid #2a2a35",
                borderRadius: "8px", padding: "12px 16px",
              }}>
                <div style={{ fontSize: "11px", color: "#505060", marginBottom: "6px", fontFamily: "'DM Sans', sans-serif" }}>
                  💬 Anonymous · {timeAgo(c.created_at)}
                </div>
                <p style={{ margin: 0, fontSize: "14px", color: "#c0c0d0", lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
                  {c.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Secret key modal */}
      {showKeyModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        }}>
          <div style={{
            background: "#16161d", border: "1px solid #2a2a35",
            borderRadius: "12px", padding: "28px", maxWidth: "380px", width: "90%",
          }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "18px", fontWeight: 700, color: "#eeeef5", margin: "0 0 8px" }}>
              {pendingAction === 'delete' ? '🗑 Delete Debate' : '✏️ Edit Debate'}
            </h2>
            <p style={{ color: "#7878a0", fontSize: "14px", margin: "0 0 16px", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
              Enter the secret key you set when creating this post.
            </p>
            <input
              type="password"
              value={keyInput}
              onChange={e => { setKeyInput(e.target.value); setKeyError(""); }}
              placeholder="Secret key..."
              onKeyDown={e => e.key === 'Enter' && confirmAction()}
              style={{
                width: "100%", background: "#0f0f13",
                border: `1px solid ${keyError ? '#f03e3e' : '#2a2a35'}`,
                borderRadius: "7px", padding: "10px 14px", color: "#e2e2e8",
                fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box", outline: "none", marginBottom: "8px",
              }}
            />
            {keyError && (
              <p style={{ color: "#f03e3e", fontSize: "12px", margin: "0 0 12px", fontFamily: "'DM Sans', sans-serif" }}>
                {keyError}
              </p>
            )}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button onClick={() => setShowKeyModal(false)} style={{
                background: "transparent", border: "1px solid #2a2a35", borderRadius: "7px",
                padding: "8px 16px", color: "#7878a0", fontSize: "13px", fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
              }}>
                Cancel
              </button>
              <button onClick={confirmAction} style={{
                background: pendingAction === 'delete' ? "#f03e3e" : "#1e1e2a",
                border: pendingAction === 'delete' ? "none" : "1px solid #2a2a35",
                borderRadius: "7px", padding: "8px 16px",
                color: pendingAction === 'delete' ? "#fff" : "#c0c0d0",
                fontSize: "13px", fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
              }}>
                {pendingAction === 'delete' ? 'Yes, Delete' : 'Continue to Edit'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DebateDetail;