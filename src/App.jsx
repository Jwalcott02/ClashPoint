import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import CreateDebate from "./pages/CreateDebate";
import DebateDetail from "./pages/DebateDetail";
import EditDebate from "./pages/EditDebate";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <nav>
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
          <span style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: "#f03e3e", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "14px", flexShrink: 0,
          }}>⚔️</span>
          <span style={{
            fontFamily: "'Sora', sans-serif", fontSize: "18px",
            fontWeight: 700, color: "#fff", letterSpacing: "-0.3px",
          }}>
            <span style={{ color: "#f03e3e" }}>Clash</span>Point
          </span>
        </Link>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
          <Link to="/create" style={{
            background: "#f03e3e",
            color: "#fff",
            padding: "7px 16px",
            borderRadius: "7px",
            fontSize: "13px",
            fontWeight: 600,
            textDecoration: "none",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            + Create Debate
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/"                  element={<Home />} />
        <Route path="/create"            element={<CreateDebate />} />
        <Route path="/debate/:id"        element={<DebateDetail />} />
        <Route path="/debate/:id/edit"   element={<EditDebate />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;