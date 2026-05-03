import { supabase } from '../client'
import { useState } from 'react'

const CreateDebate = () => {

  const [debate, setDebate] = useState({
    title: "",
    description: "",
    image_url: "",
    secret_key: "",
    repost_of: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target
    setDebate((prev) => ({ ...prev, [name]: value }))
  }

  const createDebate = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase
      .from('debates')
      .insert({
        title: debate.title,
        description: debate.description,
        image_url: debate.image_url,
        upvotes: 0,
        secret_key: debate.secret_key,
        repost_of: debate.repost_of ? parseInt(debate.repost_of) : null,
      })
      .select();

    setLoading(false);

    if (error) {
      console.error('Insert failed:', error.message);
      setError(error.message);
      return;
    }

    window.location = "/";
  }

  return (
    <div style={{ maxWidth: "640px", margin: "40px auto", padding: "0 20px" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "22px", fontWeight: 700, color: "#eeeef5", margin: "0 0 6px" }}>
          <span style={{ color: "#f03e3e" }}>⚔️</span> Create a Debate
        </h1>
        <p style={{ color: "#505060", fontSize: "14px", margin: 0 }}>
          Start a clash. Make your case and let the community decide.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          background: "#2a1010",
          border: "1px solid #f03e3e",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "16px",
          color: "#f03e3e",
          fontSize: "14px",
        }}>
          <strong>Failed to create debate:</strong> {error}
        </div>
      )}

      {/* Card */}
      <div style={{ background: "#16161d", border: "1px solid #2a2a35", borderRadius: "12px", padding: "28px" }}>
        <form onSubmit={createDebate} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="title" style={{ fontSize: "13px", fontWeight: 600, color: "#c0c0d0" }}>
              Title <span style={{ color: "#f03e3e" }}>*</span>
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={debate.title}
              onChange={handleChange}
              placeholder="e.g. Homelander vs Omni Man — who wins?"
              required
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="description" style={{ fontSize: "13px", fontWeight: 600, color: "#c0c0d0" }}>
              Description <span style={{ color: "#f03e3e" }}>*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={debate.description}
              onChange={handleChange}
              placeholder="Set the stage — what's the debate about? Give some context."
              required
              rows={5}
              style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }}
            />
          </div>

          {/* Image URL */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="image_url" style={{ fontSize: "13px", fontWeight: 600, color: "#c0c0d0" }}>
              Image URL <span style={{ color: "#505060", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="image_url"
              type="text"
              name="image_url"
              value={debate.image_url}
              onChange={handleChange}
              placeholder="https://..."
              style={inputStyle}
            />
            {debate.image_url && (
              <img
                src={debate.image_url}
                alt="Preview"
                style={{ width: "100%", maxHeight: "240px", objectFit: "cover", borderRadius: "8px", border: "1px solid #2a2a35", marginTop: "8px" }}
              />
            )}
          </div>

          {/* Secret Key */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="secret_key" style={{ fontSize: "13px", fontWeight: 600, color: "#c0c0d0" }}>
              Secret Key <span style={{ color: "#f03e3e" }}>*</span>
            </label>
            <input
              id="secret_key"
              type="password"
              name="secret_key"
              value={debate.secret_key}
              onChange={handleChange}
              placeholder="Set a key to protect your post"
              required
              style={inputStyle}
            />
            <p style={{ fontSize: "12px", color: "#505060", margin: 0 }}>
              You'll need this to edit or delete your post later. Don't forget it!
            </p>
          </div>

          {/* Repost of */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="repost_of" style={{ fontSize: "13px", fontWeight: 600, color: "#c0c0d0" }}>
              Repost of Post ID <span style={{ color: "#505060", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="repost_of"
              type="number"
              name="repost_of"
              value={debate.repost_of}
              onChange={handleChange}
              placeholder="Enter a post ID to reference it..."
              style={inputStyle}
            />
            <p style={{ fontSize: "12px", color: "#505060", margin: 0 }}>
              Find a post's ID on the home feed next to the time — e.g. ID: 42
            </p>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #2a2a35" }} />

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => window.location = "/"} style={cancelBtnStyle}>
              Cancel
            </button>
            <button type="submit" style={{ ...submitBtnStyle, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }} disabled={loading}>
              {loading ? "Posting..." : "⚔️ Post Debate"}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

const inputStyle = {
  background: "#0f0f13",
  border: "1px solid #2a2a35",
  borderRadius: "7px",
  padding: "10px 14px",
  color: "#e2e2e8",
  fontSize: "14px",
  fontFamily: "'DM Sans', Arial, sans-serif",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
}

const submitBtnStyle = {
  background: "#f03e3e",
  color: "#fff",
  border: "none",
  borderRadius: "7px",
  padding: "10px 22px",
  fontSize: "14px",
  fontWeight: 600,
  fontFamily: "'DM Sans', Arial, sans-serif",
  cursor: "pointer",
}

const cancelBtnStyle = {
  background: "transparent",
  color: "#7878a0",
  border: "1px solid #2a2a35",
  borderRadius: "7px",
  padding: "10px 18px",
  fontSize: "14px",
  fontWeight: 600,
  fontFamily: "'DM Sans', Arial, sans-serif",
  cursor: "pointer",
}

export default CreateDebate