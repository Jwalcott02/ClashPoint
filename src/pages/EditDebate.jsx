import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../client';
import { useLocation } from 'react-router-dom';

const EditDebate = () => {
  const { id } = useParams();


  const location = useLocation();

    if (!location.state?.authorized) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px" }}>
        <p style={{ color: "#f03e3e", fontFamily: "'Sora', sans-serif", fontSize: "18px", fontWeight: 700 }}>
            🔒 Access Denied
        </p>
        <p style={{ color: "#505060", fontFamily: "'DM Sans', sans-serif", fontSize: "14px" }}>
            You need to verify your secret key to edit this debate.
        </p>
        <a href={`/debate/${id}`} style={{ color: "#7878a0", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>
            ← Go back to debate
        </a>
        </div>
    );
    }

  const [debate, setDebate] = useState({
    title: "",
    description: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchDebate = async () => {
      const { data, error } = await supabase
        .from('debates')
        .select()
        .eq('id', id)
        .single();

      if (error) { console.error(error); return; }

      setDebate({
        title: data.title,
        description: data.description,
        image_url: data.image_url ?? "",
      });
      setLoading(false);
    };
    fetchDebate();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDebate((prev) => ({ ...prev, [name]: value }));
  };

  const updateDebate = async (event) => {
    event.preventDefault();
    await supabase
      .from('debates')
      .update({
        title: debate.title,
        description: debate.description,
        image_url: debate.image_url,
      })
      .eq('id', id)
      .select();
    window.location = `/debate/${id}`;
  };

  const deleteDebate = async () => {
    await supabase.from('debates').delete().eq('id', id);
    window.location = "/";
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <p style={{ color: "#505060", fontFamily: "'DM Sans', sans-serif" }}>Loading debate...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: "640px", margin: "32px auto", padding: "0 20px" }}>

      {/* Back link */}
      <Link to={`/debate/${id}`} style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        color: "#7878a0", fontSize: "13px", fontWeight: 600,
        textDecoration: "none", marginBottom: "20px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        ← Back to Debate
      </Link>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: "22px", fontWeight: 700,
          color: "#eeeef5", margin: "0 0 6px",
        }}>
          ✏️ Edit Debate
        </h1>
        <p style={{ color: "#505060", fontSize: "14px", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
          Update your debate or remove it from ClashPoint.
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: "#16161d",
        border: "1px solid #2a2a35",
        borderRadius: "12px",
        padding: "28px",
      }}>
        <form onSubmit={updateDebate} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#c0c0d0", fontFamily: "'DM Sans', sans-serif" }}>
              Title <span style={{ color: "#f03e3e" }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={debate.title}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#c0c0d0", fontFamily: "'DM Sans', sans-serif" }}>
              Description <span style={{ color: "#f03e3e" }}>*</span>
            </label>
            <textarea
              name="description"
              value={debate.description}
              onChange={handleChange}
              required
              rows={5}
              style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }}
            />
          </div>

          {/* Image URL */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#c0c0d0", fontFamily: "'DM Sans', sans-serif" }}>
              Image URL <span style={{ color: "#505060", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
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
                style={{
                  width: "100%", maxHeight: "220px",
                  objectFit: "cover", borderRadius: "8px",
                  border: "1px solid #2a2a35", marginTop: "8px",
                }}
              />
            )}
          </div>

          <div style={{ borderTop: "1px solid #2a2a35" }} />

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "space-between", alignItems: "center" }}>

            {/* Delete */}
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              style={deleteBtnStyle}
            >
              🗑 Delete
            </button>

            <div style={{ display: "flex", gap: "10px" }}>
              <Link to={`/debate/${id}`} style={{ ...cancelBtnStyle, display: "inline-flex", alignItems: "center" }}>
                Cancel
              </Link>
              <button type="submit" style={submitBtnStyle}>
                ✏️ Save Changes
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* Delete confirmation modal */}
      {showConfirm && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100,
        }}>
          <div style={{
            background: "#16161d",
            border: "1px solid #2a2a35",
            borderRadius: "12px",
            padding: "28px",
            maxWidth: "380px",
            width: "90%",
          }}>
            <h2 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "18px", fontWeight: 700,
              color: "#eeeef5", margin: "0 0 10px",
            }}>
              Delete this debate?
            </h2>
            <p style={{ color: "#7878a0", fontSize: "14px", margin: "0 0 24px", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
              This can't be undone. The debate and all its data will be permanently removed.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowConfirm(false)} style={cancelBtnStyle}>
                Cancel
              </button>
              <button onClick={deleteDebate} style={{ ...deleteBtnStyle, padding: "9px 20px" }}>
                Yes, delete it
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

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
};

const submitBtnStyle = {
  background: "#f03e3e",
  color: "#fff",
  border: "none",
  borderRadius: "7px",
  padding: "9px 20px",
  fontSize: "13px",
  fontWeight: 600,
  fontFamily: "'DM Sans', Arial, sans-serif",
  cursor: "pointer",
};

const cancelBtnStyle = {
  background: "transparent",
  color: "#7878a0",
  border: "1px solid #2a2a35",
  borderRadius: "7px",
  padding: "9px 18px",
  fontSize: "13px",
  fontWeight: 600,
  fontFamily: "'DM Sans', Arial, sans-serif",
  cursor: "pointer",
  textDecoration: "none",
};

const deleteBtnStyle = {
  background: "transparent",
  color: "#f03e3e",
  border: "1px solid #f03e3e44",
  borderRadius: "7px",
  padding: "9px 16px",
  fontSize: "13px",
  fontWeight: 600,
  fontFamily: "'DM Sans', Arial, sans-serif",
  cursor: "pointer",
};

export default EditDebate;