"use client";
import { useState } from "react";

// ── Types ──────────────────────────────────────────────
type Result = {
  pincode: string;
  officename: string;
  officetype: string;
  delivery: string;
  district: string;
  statename: string;
  divisionname: string;
  regionname: string;
  circlename: string;
};

type SearchMode = "smart" | "area" | "pincode" | "postoffice";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ── Fetch from Supabase ────────────────────────────────
async function fetchPincodes(query: string, mode: SearchMode): Promise<Result[]> {
  const q = query.trim();
  if (!q) return [];

  const isNumeric = /^\d+$/.test(q);
  let url = "";

  if (mode === "pincode" || (mode === "smart" && isNumeric)) {
    url = `${SUPABASE_URL}/rest/v1/pincodes?pincode=like.${q}*&limit=20&select=pincode,officename,officetype,delivery,district,statename,divisionname,regionname,circlename`;
  } else if (mode === "postoffice") {
    url = `${SUPABASE_URL}/rest/v1/pincodes?officename=ilike.*${q}*&limit=20&select=pincode,officename,officetype,delivery,district,statename,divisionname,regionname,circlename`;
  } else {
    // area or smart text — search across multiple fields
    url = `${SUPABASE_URL}/rest/v1/pincodes?or=(officename.ilike.*${q}*,district.ilike.*${q}*,statename.ilike.*${q}*)&limit=20&select=pincode,officename,officetype,delivery,district,statename,divisionname,regionname,circlename`;
  }

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!res.ok) return [];
  return res.json();
}

const states = [
  { name: "Andhra Pradesh", code: "andhra-pradesh", offices: "2,892" },
  { name: "Arunachal Pradesh", code: "arunachal-pradesh", offices: "418" },
  { name: "Assam", code: "assam", offices: "3,241" },
  { name: "Bihar", code: "bihar", offices: "8,973" },
  { name: "Chhattisgarh", code: "chhattisgarh", offices: "2,441" },
  { name: "Delhi", code: "delhi", offices: "1,208" },
  { name: "Goa", code: "goa", offices: "312" },
  { name: "Gujarat", code: "gujarat", offices: "6,821" },
  { name: "Haryana", code: "haryana", offices: "3,102" },
  { name: "Himachal Pradesh", code: "himachal-pradesh", offices: "2,714" },
  { name: "Jharkhand", code: "jharkhand", offices: "2,988" },
  { name: "Karnataka", code: "karnataka", offices: "8,311" },
  { name: "Kerala", code: "kerala", offices: "5,542" },
  { name: "Madhya Pradesh", code: "madhya-pradesh", offices: "10,241" },
  { name: "Maharashtra", code: "maharashtra", offices: "13,492" },
  { name: "Manipur", code: "manipur", offices: "541" },
  { name: "Meghalaya", code: "meghalaya", offices: "498" },
  { name: "Mizoram", code: "mizoram", offices: "312" },
  { name: "Nagaland", code: "nagaland", offices: "284" },
  { name: "Odisha", code: "odisha", offices: "6,712" },
  { name: "Punjab", code: "punjab", offices: "3,841" },
  { name: "Rajasthan", code: "rajasthan", offices: "11,302" },
  { name: "Sikkim", code: "sikkim", offices: "198" },
  { name: "Tamil Nadu", code: "tamil-nadu", offices: "12,541" },
  { name: "Telangana", code: "telangana", offices: "4,821" },
  { name: "Tripura", code: "tripura", offices: "712" },
  { name: "Uttar Pradesh", code: "uttar-pradesh", offices: "19,841" },
  { name: "Uttarakhand", code: "uttarakhand", offices: "2,104" },
  { name: "West Bengal", code: "west-bengal", offices: "10,312" },
  { name: "Jammu & Kashmir", code: "jammu-kashmir", offices: "1,842" },
  { name: "Ladakh", code: "ladakh", offices: "198" },
  { name: "Puducherry", code: "puducherry", offices: "284" },
  { name: "Chandigarh", code: "chandigarh", offices: "98" },
  { name: "Andaman & Nicobar", code: "andaman-nicobar", offices: "212" },
  { name: "Lakshadweep", code: "lakshadweep", offices: "72" },
  { name: "Dadra & NH", code: "dadra-nh", offices: "142" },
];

const popularSearches = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "520001", "110001", "Chennai", "Pune"];

// ── Office Type Badge ──────────────────────────────────
function TypeBadge({ type }: { type: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    HO: { bg: "#1a3a2a", color: "#fff", label: "Head Office" },
    SO: { bg: "#e8f4ec", color: "#1a3a2a", label: "Sub Office" },
    BO: { bg: "#fef3c7", color: "#92400e", label: "Branch Office" },
  };
  const s = map[type] || { bg: "#eee", color: "#555", label: type };
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: "11px", padding: "3px 10px", borderRadius: "100px", fontWeight: 600, fontFamily: "system-ui,sans-serif", letterSpacing: "0.3px" }}>
      {s.label}
    </span>
  );
}

// ── Result Card ────────────────────────────────────────
function ResultCard({ r }: { r: Result }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(r.pincode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: "16px", padding: "24px", marginBottom: "12px", transition: "box-shadow 0.2s" }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 8px 32px rgba(26,58,42,0.10)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{ fontSize: "30px", fontWeight: 700, color: "#1a3a2a", letterSpacing: "-0.5px" }}>{r.pincode}</span>
            <TypeBadge type={r.officetype} />
          </div>
          <div style={{ fontSize: "17px", fontWeight: 600, color: "#222", fontFamily: "system-ui,sans-serif" }}>{r.officename}</div>
        </div>
        <button onClick={copy}
          style={{ background: copied ? "#1a3a2a" : "#f4f1eb", color: copied ? "#fff" : "#1a3a2a", border: "none", borderRadius: "10px", padding: "10px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "system-ui,sans-serif", transition: "all 0.2s", whiteSpace: "nowrap" }}>
          {copied ? "✓ Copied!" : "Copy PIN"}
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", background: "#fafaf8", borderRadius: "12px", padding: "16px" }}>
        {[
          { label: "District", value: r.district },
          { label: "State", value: r.statename },
          { label: "Circle", value: r.circlename },
          { label: "Division", value: r.divisionname },
          { label: "Region", value: r.regionname },
          { label: "Delivery", value: r.delivery },
        ].map(item => (
          <div key={item.label}>
            <div style={{ fontSize: "11px", color: "#999", fontFamily: "system-ui,sans-serif", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#333", fontFamily: "system-ui,sans-serif" }}>{item.value || "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────
export default function Home() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("smart");
  const [results, setResults] = useState<Result[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    const res = await fetchPincodes(q, mode);
    setResults(res);
    setLoading(false);
    setRecentSearches(prev => [q, ...prev.filter(s => s !== q)].slice(0, 5));
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") doSearch(query);
  };

  const modeConfig = [
    { key: "smart", icon: "🔍", label: "Smart Search" },
    { key: "area", icon: "📍", label: "By Area" },
    { key: "pincode", icon: "🔢", label: "By PIN Code" },
    { key: "postoffice", icon: "📮", label: "By Post Office" },
  ];

  const placeholders: Record<SearchMode, string> = {
    smart: "Search by area, PIN code or post office name...",
    area: "Enter area, locality or district name...",
    pincode: "Enter 6-digit PIN code e.g. 520001...",
    postoffice: "Enter post office name e.g. Vijayawada HO...",
  };

  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", minHeight: "100vh", background: "#FAFAF8" }}>

      {/* Top bar */}
      <div style={{ background: "#1a3a2a", color: "#7dba8e", fontSize: "12px", textAlign: "center", padding: "7px 16px", letterSpacing: "0.4px", fontFamily: "system-ui,sans-serif" }}>
        🇮🇳 India's Most Complete PIN Code Directory — 1,65,627 Post Offices · Free Forever · Updated Daily
      </div>

      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e8e4dc", padding: "0 24px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "38px", height: "38px", background: "#1a3a2a", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📮</div>
            <div style={{ fontWeight: 700, fontSize: "19px", color: "#1a3a2a", letterSpacing: "-0.3px" }}>
              IndPostalCode<span style={{ color: "#7dba8e" }}>.in</span>
            </div>
          </div>
          <nav style={{ display: "flex", gap: "28px", fontSize: "14px", fontFamily: "system-ui,sans-serif" }}>
            {["States", "Cities", "About", "Contact"].map(l => (
              <a key={l} href={`/${l.toLowerCase()}`} style={{ textDecoration: "none", color: "#555", fontWeight: 500 }}>{l}</a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: "linear-gradient(150deg,#1a3a2a 0%,#2d5a3d 55%,#3d7a52 100%)", padding: "72px 24px 96px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "350px", height: "350px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: "-100px", left: "-60px", width: "280px", height: "280px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)" }} />
        <div style={{ maxWidth: "780px", margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "100px", padding: "6px 18px", fontSize: "13px", color: "#a8d8b8", marginBottom: "24px", fontFamily: "system-ui,sans-serif" }}>
            ✦ Free · Fast · Accurate · No Registration Needed
          </div>
          <h1 style={{ fontSize: "clamp(30px,5vw,54px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, marginBottom: "14px", letterSpacing: "-1px" }}>
            Find Any Indian<br /><span style={{ color: "#7dba8e" }}>PIN Code</span> Instantly
          </h1>
          <p style={{ fontSize: "17px", color: "#a8c5b0", marginBottom: "40px", lineHeight: 1.7, fontFamily: "system-ui,sans-serif" }}>
            Search by <b style={{ color: "#c8e8d0" }}>Area Name</b> · <b style={{ color: "#c8e8d0" }}>PIN Code</b> · <b style={{ color: "#c8e8d0" }}>Post Office Name</b><br />
            Covering 1,65,627 post offices across all 36 states & UTs
          </p>

          {/* Mode Tabs */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            {modeConfig.map(m => (
              <button key={m.key} onClick={() => setMode(m.key as SearchMode)}
                style={{ background: mode === m.key ? "#fff" : "rgba(255,255,255,0.1)", color: mode === m.key ? "#1a3a2a" : "#c8e8d0", border: mode === m.key ? "2px solid #fff" : "1px solid rgba(255,255,255,0.2)", borderRadius: "100px", padding: "9px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "system-ui,sans-serif", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px" }}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ display: "flex", maxWidth: "640px", margin: "0 auto", background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.28)" }}>
            <input type="text" value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder={placeholders[mode]}
              style={{ flex: 1, padding: "20px 24px", fontSize: "15px", border: "none", outline: "none", color: "#1a3a2a", fontFamily: "system-ui,sans-serif", background: "transparent" }} />
            <button onClick={() => doSearch(query)}
              style={{ background: "#1a3a2a", color: "#fff", border: "none", padding: "20px 32px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "system-ui,sans-serif", transition: "background 0.2s", whiteSpace: "nowrap" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#2d5a3d")}
              onMouseLeave={e => (e.currentTarget.style.background = "#1a3a2a")}>
              {loading ? "..." : "Search →"}
            </button>
          </div>

          {/* Popular pills */}
          <div style={{ marginTop: "22px", display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
            <span style={{ color: "#6a9a7a", fontSize: "13px", fontFamily: "system-ui,sans-serif", lineHeight: "28px" }}>Popular:</span>
            {popularSearches.map(s => (
              <button key={s} onClick={() => { setQuery(s); doSearch(s); }}
                style={{ background: "rgba(255,255,255,0.1)", color: "#c8e8d0", fontSize: "13px", padding: "5px 14px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.18)", cursor: "pointer", fontFamily: "system-ui,sans-serif", transition: "all 0.2s" }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      {searched && (
        <section style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1a3a2a", marginBottom: "4px" }}>
                {loading ? "Searching..." : results.length > 0 ? `${results.length} Result${results.length > 1 ? "s" : ""} Found` : "No Results Found"}
              </h2>
              <p style={{ fontSize: "14px", color: "#999", fontFamily: "system-ui,sans-serif" }}>
                {loading ? "Fetching from database..." : results.length > 0 ? `Showing results for "${query}"` : `No matches for "${query}"`}
              </p>
            </div>
            <button onClick={() => { setSearched(false); setQuery(""); setResults([]); }}
              style={{ background: "#f4f1eb", color: "#1a3a2a", border: "none", borderRadius: "10px", padding: "10px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "system-ui,sans-serif" }}>
              ← New Search
            </button>
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: "64px 24px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
              <p style={{ color: "#999", fontFamily: "system-ui,sans-serif" }}>Searching 1,65,627 post offices...</p>
            </div>
          )}

          {!loading && results.length > 0 && results.map((r, i) => <ResultCard key={i} r={r} />)}

          {!loading && results.length === 0 && (
            <div style={{ textAlign: "center", padding: "64px 24px", background: "#fff", borderRadius: "16px", border: "1px solid #e8e4dc" }}>
              <div style={{ fontSize: "52px", marginBottom: "16px" }}>🔍</div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#1a3a2a", marginBottom: "8px" }}>No results found</h3>
              <p style={{ color: "#999", fontFamily: "system-ui,sans-serif", marginBottom: "24px" }}>Try a different keyword or PIN code</p>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                {["520001", "110001", "Mumbai", "Delhi"].map(s => (
                  <button key={s} onClick={() => { setQuery(s); doSearch(s); }}
                    style={{ background: "#f4f1eb", color: "#1a3a2a", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "14px", cursor: "pointer", fontFamily: "system-ui,sans-serif", fontWeight: 600 }}>
                    Try "{s}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Recent Searches */}
      {!searched && recentSearches.length > 0 && (
        <section style={{ maxWidth: "860px", margin: "32px auto 0", padding: "0 24px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e8e4dc", padding: "20px 24px" }}>
            <div style={{ fontSize: "12px", color: "#999", fontFamily: "system-ui,sans-serif", marginBottom: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>🕐 Recent Searches</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {recentSearches.map(s => (
                <button key={s} onClick={() => { setQuery(s); doSearch(s); }}
                  style={{ background: "#f4f1eb", color: "#1a3a2a", border: "1px solid #e8e4dc", borderRadius: "8px", padding: "7px 16px", fontSize: "14px", cursor: "pointer", fontFamily: "system-ui,sans-serif", fontWeight: 600 }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Below fold */}
      {!searched && (
        <>
          {/* Stats */}
          <div style={{ background: "#fff", borderTop: "1px solid #eee", borderBottom: "1px solid #eee", margin: "48px 0 0", padding: "0 24px" }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", textAlign: "center" }}>
              {[
                { num: "1,65,627", label: "Post Offices" },
                { num: "19,101", label: "Unique PIN Codes" },
                { num: "36", label: "States & UTs" },
                { num: "100%", label: "Free Forever" },
              ].map((s, i) => (
                <div key={i} style={{ padding: "28px 16px", borderRight: i < 3 ? "1px solid #eee" : "none" }}>
                  <div style={{ fontSize: "26px", fontWeight: 700, color: "#1a3a2a", letterSpacing: "-0.5px" }}>{s.num}</div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "4px", fontFamily: "system-ui,sans-serif" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 3 Ways */}
          <section style={{ background: "#fff", padding: "80px 24px" }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: "56px" }}>
                <h2 style={{ fontSize: "34px", fontWeight: 700, color: "#1a3a2a", letterSpacing: "-0.5px", marginBottom: "12px" }}>3 Ways to Search</h2>
                <p style={{ color: "#888", fontSize: "16px", fontFamily: "system-ui,sans-serif" }}>Choose the method that suits you best</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "24px" }}>
                {[
                  { icon: "📍", title: "Search by Area", desc: "Type your locality, village, town or city name. Get the exact PIN code and post office details in seconds.", eg: "e.g. Labbipet, Banjara Hills, Andheri West", mode: "area" },
                  { icon: "🔢", title: "Search by PIN Code", desc: "Already have a 6-digit PIN code? Enter it to see the full post office name, district, state and delivery info.", eg: "e.g. 520001, 110001, 400001", mode: "pincode" },
                  { icon: "📮", title: "Search by Post Office", desc: "Know the post office name? Find its PIN code, location, office type and complete delivery information.", eg: "e.g. Vijayawada HO, Mumbai GPO", mode: "postoffice" },
                ].map(item => (
                  <div key={item.title}
                    style={{ background: "#fafaf8", border: "1px solid #e8e4dc", borderRadius: "20px", padding: "32px", cursor: "pointer", transition: "all 0.2s" }}
                    onClick={() => { setMode(item.mode as SearchMode); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a3a2a"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(26,58,42,0.10)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e4dc"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                    <div style={{ fontSize: "42px", marginBottom: "16px" }}>{item.icon}</div>
                    <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#1a3a2a", marginBottom: "12px" }}>{item.title}</h3>
                    <p style={{ fontSize: "15px", color: "#666", lineHeight: 1.7, fontFamily: "system-ui,sans-serif", marginBottom: "16px" }}>{item.desc}</p>
                    <div style={{ fontSize: "13px", color: "#1a3a2a", fontFamily: "system-ui,sans-serif", fontStyle: "italic", background: "#e8f4ec", padding: "8px 12px", borderRadius: "8px" }}>{item.eg}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* States */}
          <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "72px 24px" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ fontSize: "34px", fontWeight: 700, color: "#1a3a2a", letterSpacing: "-0.5px", marginBottom: "12px" }}>Browse by State</h2>
              <p style={{ color: "#888", fontSize: "16px", fontFamily: "system-ui,sans-serif" }}>Select your state to explore all districts and PIN codes</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: "12px" }}>
              {states.map(state => (
                <a key={state.code} href={`/state/${state.code}`}
                  style={{ display: "block", background: "#fff", border: "1px solid #e8e4dc", borderRadius: "12px", padding: "16px 20px", textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a3a2a"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,58,42,0.10)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e4dc"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ fontWeight: 600, color: "#1a3a2a", fontSize: "15px", marginBottom: "4px" }}>{state.name}</div>
                  <div style={{ fontSize: "12px", color: "#999", fontFamily: "system-ui,sans-serif" }}>{state.offices} post offices</div>
                </a>
              ))}
            </div>
          </section>

          {/* SEO Content */}
          <section style={{ background: "#fff", padding: "72px 24px" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <h2 style={{ fontSize: "30px", fontWeight: 700, color: "#1a3a2a", marginBottom: "20px" }}>About Indian PIN Codes</h2>
              <div style={{ fontSize: "16px", color: "#555", lineHeight: 1.9, fontFamily: "system-ui,sans-serif" }}>
                <p style={{ marginBottom: "16px" }}>A PIN Code (Postal Index Number) is a 6-digit code used by India Post to identify specific post offices across India. Introduced on 15th August 1972, the PIN code system helps in efficient sorting and delivery of mail across the country.</p>
                <p style={{ marginBottom: "16px" }}>The first digit represents the postal zone — there are 9 PIN zones in India. The first two digits identify the sub-region or postal circle. The third digit indicates the sorting district, and the last three digits pinpoint the specific post office.</p>
                <p>IndPostalCode.in provides a free and comprehensive directory of all PIN codes in India, covering over 1,65,627 post offices across 36 states and union territories. Search by area name, PIN code, or post office name to instantly find accurate postal information.</p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer style={{ background: "#111", color: "#666", padding: "56px 24px 32px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "48px", marginBottom: "48px" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "20px", color: "#fff", marginBottom: "12px" }}>IndPostalCode<span style={{ color: "#7dba8e" }}>.in</span></div>
              <p style={{ fontSize: "14px", lineHeight: 1.8, fontFamily: "system-ui,sans-serif", maxWidth: "280px", color: "#666" }}>India's most complete PIN code directory. Search by area, PIN code or post office name. Free forever.</p>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: "#aaa", marginBottom: "16px", fontSize: "12px", letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: "system-ui,sans-serif" }}>Quick Links</div>
              {["Home", "Browse States", "Browse Cities", "About Us", "Contact"].map(l => (
                <div key={l} style={{ marginBottom: "10px" }}>
                  <a href="#" style={{ textDecoration: "none", color: "#666", fontSize: "14px", fontFamily: "system-ui,sans-serif" }}>{l}</a>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: "#aaa", marginBottom: "16px", fontSize: "12px", letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: "system-ui,sans-serif" }}>Legal</div>
              {["Privacy Policy", "Terms of Use", "Disclaimer", "Contact Us"].map(l => (
                <div key={l} style={{ marginBottom: "10px" }}>
                  <a href="#" style={{ textDecoration: "none", color: "#666", fontSize: "14px", fontFamily: "system-ui,sans-serif" }}>{l}</a>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid #222", paddingTop: "24px", display: "flex", justifyContent: "space-between", fontSize: "13px", fontFamily: "system-ui,sans-serif", flexWrap: "wrap", gap: "8px" }}>
            <span>© 2026 IndPostalCode.in — All rights reserved.</span>
            <span style={{ color: "#444" }}>Data sourced from India Post · Updated regularly</span>
          </div>
        </div>
      </footer>
    </div>
  );
}