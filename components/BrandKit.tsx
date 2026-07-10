"use client";

import { useApp } from "@/hooks/useAppData";

const COLORS = [
  { name: "Primary", hex: "#16265C", role: "Logo, primary buttons, headings", bg: "#16265C", fg: "#fff" },
  { name: "Secondary", hex: "#0F1A3D", role: "Backgrounds, dark mode", bg: "#0F1A3D", fg: "#fff" },
  { name: "Accent", hex: "#FFFFFF", role: "Text on dark backgrounds", bg: "#FFFFFF", fg: "#0D1B3D", border: true },
  { name: "Light", hex: "#F8F9FA", role: "Backgrounds, cards", bg: "#F8F9FA", fg: "#1F2937", border: true },
  { name: "Text", hex: "#1F2937", role: "Body text", bg: "#1F2937", fg: "#fff" },
];

const DOS = [
  "Maintain original proportions",
  "Use sufficient clear space around the logo",
  "Use on appropriate backgrounds (good contrast)",
  "Use the SVG version whenever possible for scalability",
];

const DONTS = [
  "Do not stretch or distort the logo",
  "Do not change the brand color",
  "Do not add effects (shadows, gradients, outlines)",
  "Do not place the logo on busy backgrounds without proper contrast",
  "Do not animate the logo without approval",
];

export default function BrandKit() {
  const { isAdmin } = useApp();

  return (
    <div className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">Brand Kit</div>
          <div className="section-line"></div>
        </div>
      </div>

      {/* Tagline + Overview */}
      <div className="card mb20">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--muted)", fontFamily: "var(--fm)" }}>PHANTIX SECURITY SOLUTIONS</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--white)", fontFamily: "var(--fd)", marginTop: 2 }}>PROTECT. PREVENT. PERFORM.</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Primary: <span className="mono" style={{ color: "var(--white)" }}>#16265C</span></div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>v1.0 — July 2026</div>
        </div>
      </div>

      {/* Primary Logo */}
      <div className="card mb20">
        <div className="card-label" style={{ marginBottom: 12 }}>Primary Logo</div>
        <div style={{ background: "#F8F9FA", borderRadius: 12, padding: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border2)" }}>
          <img src="/logo.png" alt="Phantix Primary Logo" style={{ maxWidth: 260, width: "100%", height: "auto" }} />
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--silver)" }}>
          Stylized eagle head seamlessly integrated with a shield shape. Represents strength, protection, and vigilance.<br />
          Minimum digital size: 120px width. Use on light backgrounds. Master color: <span className="mono" style={{ color: "var(--white)" }}>#16265C</span>
        </div>
      </div>

      {/* Color Palette */}
      <div className="card mb20">
        <div className="card-label" style={{ marginBottom: 12 }}>Color Palette</div>
        <table className="dtable">
          <thead>
            <tr>
              <th>Role</th>
              <th>Swatch</th>
              <th>Hex</th>
              <th>Usage</th>
            </tr>
          </thead>
          <tbody>
            {COLORS.map((c) => (
              <tr key={c.name}>
                <td style={{ fontWeight: 600, color: "var(--white)" }}>{c.name}</td>
                <td>
                  <div
                    style={{
                      width: 42,
                      height: 28,
                      background: c.bg,
                      border: c.border ? "1px solid var(--border)" : "none",
                      borderRadius: 4,
                    }}
                  />
                </td>
                <td>
                  <span className="mono" style={{ color: "var(--silver)", fontSize: 13 }}>{c.hex}</span>
                </td>
                <td style={{ color: "var(--muted)", fontSize: 12 }}>{c.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--muted)" }}>
          The logo should almost always appear in <span className="mono">#16265C</span>. Only use the white version on dark backgrounds.
        </div>
      </div>

      {/* Logo Usage Guidelines */}
      <div className="grid2" style={{ gap: 16 }}>
        <div className="card">
          <div className="card-label" style={{ marginBottom: 10, color: "var(--success)" }}>DO’S</div>
          <ul style={{ fontSize: 12, color: "var(--silver)", paddingLeft: 18, lineHeight: 1.7, margin: 0 }}>
            {DOS.map((d, i) => <li key={i} style={{ marginBottom: 4 }}>{d}</li>)}
          </ul>
        </div>
        <div className="card">
          <div className="card-label" style={{ marginBottom: 10, color: "var(--danger)" }}>DON’TS</div>
          <ul style={{ fontSize: 12, color: "var(--silver)", paddingLeft: 18, lineHeight: 1.7, margin: 0 }}>
            {DONTS.map((d, i) => <li key={i} style={{ marginBottom: 4 }}>{d}</li>)}
          </ul>
        </div>
      </div>

      {/* Typography */}
      <div className="card mb20" style={{ marginTop: 16 }}>
        <div className="card-label" style={{ marginBottom: 10 }}>Typography (Recommended)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 13 }}>
          <div>
            <div style={{ color: "var(--muted)", fontSize: 10, letterSpacing: "0.12em", marginBottom: 4 }}>HEADINGS</div>
            <div style={{ color: "var(--white)", fontWeight: 700 }}>Inter / Satoshi Bold</div>
          </div>
          <div>
            <div style={{ color: "var(--muted)", fontSize: 10, letterSpacing: "0.12em", marginBottom: 4 }}>BODY</div>
            <div style={{ color: "var(--silver)" }}>Inter or system sans-serif</div>
          </div>
          <div>
            <div style={{ color: "var(--muted)", fontSize: 10, letterSpacing: "0.12em", marginBottom: 4 }}>MONOSPACE</div>
            <div style={{ color: "var(--silver)", fontFamily: "var(--fm)" }}>JetBrains Mono / Fira Code</div>
          </div>
        </div>
      </div>

      {/* Files & Implementation */}
      <div className="card">
        <div className="card-label" style={{ marginBottom: 10 }}>Files &amp; Quick Start</div>
        <div style={{ fontSize: 12, color: "var(--silver)", lineHeight: 1.6 }}>
          <strong>Recommended assets:</strong> <span className="mono">phantix-logo.svg</span>, <span className="mono">phantix-logo.png</span>, <span className="mono">favicon-512x512.png</span><br />
          Generate full favicon set (including .ico) from the 512×512 master using <a href="https://realfavicongenerator.net/" target="_blank" rel="noreferrer" style={{ color: "var(--cyan)" }}>realfavicongenerator.net</a>.
        </div>
        <pre style={{ marginTop: 12, background: "var(--surface2)", padding: 12, borderRadius: 6, fontSize: 11, color: "var(--silver)", overflowX: "auto" }}>
{`<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`}
        </pre>
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--muted)" }}>
          Current favicon set and manifest are already implemented in this Command Centre.
        </div>
      </div>

      {!isAdmin && (
        <div style={{ marginTop: 12, fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
          Admin users can update brand assets and this kit.
        </div>
      )}
    </div>
  );
}
