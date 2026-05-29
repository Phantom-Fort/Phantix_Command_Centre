"use client";

import { useApp } from "@/hooks/useAppData";
import { BOOKS, ALL_BOOKS, getSuggestions, LOCK_END } from "@/lib/data";
import { useState, useEffect, useRef } from "react";
import { addInsight as apiAddInsight, patchInsight, deleteInsight } from "@/lib/api-client";
import { addManifestEntry } from "@/lib/api-client";

export default function Insights() {
  const { insights, isAdmin, dispatch, session, showLoader, hideLoader } = useApp();
  const [filter, setFilter] = useState<string>("all");
  const [locked, setLocked] = useState(false);
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });

  const bookRef = useRef<HTMLSelectElement>(null);
  const chapterRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const catRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, LOCK_END.getTime() - Date.now());
      setLocked(diff <= 0);
      if (diff > 0) {
        setCountdown({
          d: Math.floor(diff / 86400000),
          h: Math.floor((diff % 86400000) / 3600000),
          m: Math.floor((diff % 3600000) / 60000),
          s: Math.floor((diff % 60000) / 1000),
        });
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const filtered = filter === "all" ? insights : insights.filter((i) => i.status === filter);

  const submitInsight = async () => {
    if (locked) { alert("The 6-month edit window has closed. No new insights can be added."); return; }
    const book = bookRef.current?.value || "";
    const chapter = chapterRef.current?.value.trim() || "";
    const notes = notesRef.current?.value.trim() || "";
    const category = catRef.current?.value || "";
    if (!book || !chapter || !notes) { alert("Please fill in the book, chapter(s), and reading notes."); return; }

    const bk = ALL_BOOKS.find((b) => b.t === book) || { t: book, a: "", phase: "" };
    const suggestions = getSuggestions(book, notes);

    showLoader("Saving insight…");
    try {
      const newInsight = await apiAddInsight({ book, author: bk.a, phase: bk.phase, chapter, notes, category, suggestions });
      dispatch({ type: "ADD_INSIGHT", payload: newInsight });
      if (chapterRef.current) chapterRef.current.value = "";
      if (notesRef.current) notesRef.current.value = "";
    } catch (err: any) {
      alert("Failed to save insight: " + err.message);
    }
    hideLoader();
  };

  const confirmDelib = async (id: string) => {
    const textarea = document.getElementById(`dn-${id}`) as HTMLTextAreaElement;
    const notes = textarea?.value.trim() || "Deliberated — no additional notes.";
    showLoader("Saving deliberation…");
    try {
      const today = new Date().toISOString().split("T")[0];
      await patchInsight(id, { status: "deliberated", verdict: notes, deliberatedBy: session?.name, deliberatedDate: today });
      dispatch({ type: "UPDATE_INSIGHT", payload: { id, updates: { status: "deliberated", verdict: notes, deliberatedBy: session?.name || "", deliberatedDate: today } } });
    } catch (err: any) {
      alert("Failed to save deliberation: " + err.message);
    }
    hideLoader();
  };

  const approveInsight = async (id: string) => {
    const ins = insights.find((i) => i.id === id);
    if (!ins) return;
    showLoader("Adding to manifest…");
    try {
      await patchInsight(id, { status: "approved" });
      dispatch({ type: "UPDATE_INSIGHT", payload: { id, updates: { status: "approved" } } });
      const entry = await addManifestEntry({
        title: `[Insight] ${ins.chapter} — ${ins.book}`,
        body: ins.verdict + "\n\nKey Implementation Suggestions:\n" + (ins.suggestions || []).map((s) => "• " + s).join("\n"),
        type: "feature",
        source: `${ins.book}${ins.author ? " (" + ins.author + ")" : ""}`,
        priority: "Phase 2",
        category: ins.category || "",
      });
      dispatch({ type: "ADD_MANIFEST", payload: entry });
    } catch (err: any) {
      alert("Failed to approve insight: " + err.message);
    }
    hideLoader();
  };

  const rejectInsight = async (id: string) => {
    try {
      await patchInsight(id, { status: "rejected" });
      dispatch({ type: "UPDATE_INSIGHT", payload: { id, updates: { status: "rejected" } } });
    } catch (err: any) {
      alert("Failed to reject insight: " + err.message);
    }
  };

  const delInsight = async (id: string) => {
    if (!confirm("Delete this insight permanently? This cannot be undone.")) return;
    showLoader("Deleting…");
    try {
      await deleteInsight(id);
      dispatch({ type: "DELETE_INSIGHT", payload: id });
    } catch (err: any) {
      alert("Failed to delete insight: " + err.message);
    }
    hideLoader();
  };

  const toggleDelibForm = (id: string) => {
    const el = document.getElementById(`df-${id}`);
    if (el) el.style.display = el.style.display !== "block" ? "block" : "none";
  };

  const statusChips: Record<string, string> = {
    pending: "⚠ NOT DELIBERATED",
    deliberated: "✓ DELIBERATED",
    approved: "★ IN MANIFEST",
    rejected: "✗ NOT PROCEEDING",
  };

  const statusClasses: Record<string, string> = {
    pending: "cw",
    deliberated: "cp",
    approved: "cd",
    rejected: "cn",
  };

  return (
    <div className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">Book Insights & Deliberation</div>
          <div className="section-line"></div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Select a book → log chapters read → generate implementation suggestions → deliberate → approve for manifest
          </div>
        </div>
      </div>

      <div className="countdown">
        {locked ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", fontSize: 13, color: "var(--danger)", fontFamily: "var(--fm)", padding: 14 }}>Edit window has closed</div>
        ) : (
          <>
            {[{ l: "Days", v: countdown.d }, { l: "Hours", v: countdown.h }, { l: "Minutes", v: countdown.m }, { l: "Seconds", v: countdown.s }].map((u, i) => (
              <div key={i} className="cd-unit">
                <div className="cd-val">{String(u.v).padStart(2, "0")}</div>
                <div className="cd-lbl">{u.l} remaining</div>
              </div>
            ))}
          </>
        )}
      </div>

      {locked && (
        <div className="lock-banner">
          <div style={{ fontSize: 22 }}>🔒</div>
          <div>
            <div style={{ fontFamily: "var(--fd)", fontSize: 14, fontWeight: 700, color: "var(--danger)" }}>Edit Window Closed</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>The 6-month insight logging window has expired. All existing insights are read-only.</div>
          </div>
        </div>
      )}

      {!locked && (
        <div className="card mb20">
          <div className="card-label" style={{ marginBottom: 13 }}>Log New Chapter Insight</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginBottom: 11 }}>
            <div>
              <div style={{ fontSize: 9, color: "var(--muted)", fontFamily: "var(--fm)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5 }}>Select Book</div>
              <select className="ifield" ref={bookRef}>
                {BOOKS.map((s, si) => (
                  <optgroup key={si} label={s.phase}>
                    {s.books.map((b, bi) => <option key={bi} value={b.t}>{b.t}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 9, color: "var(--muted)", fontFamily: "var(--fm)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5 }}>Chapter(s) Read</div>
              <input className="ifield" ref={chapterRef} placeholder="e.g. Chapter 4–6: Zero Trust Principles" />
            </div>
          </div>
          <div style={{ marginBottom: 11 }}>
            <div style={{ fontSize: 9, color: "var(--muted)", fontFamily: "var(--fm)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5 }}>Key Notes From This Reading</div>
            <textarea className="ifield" ref={notesRef} style={{ minHeight: 100 }} placeholder="Summarise the key concepts, frameworks, techniques, or arguments from what you read."></textarea>
          </div>
          <div style={{ display: "flex", gap: 11, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 9, color: "var(--muted)", fontFamily: "var(--fm)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5 }}>Category</div>
              <select className="ifield" ref={catRef}>
                <option>Security Architecture</option><option>AI & ML Systems</option><option>Offensive Security</option>
                <option>Distributed Systems</option><option>Cloud & Infrastructure</option><option>Product & Business</option>
                <option>Compliance & Governance</option>
              </select>
            </div>
            <button className="btn btn-pr" onClick={submitInsight} style={{ flexShrink: 0, padding: "10px 22px" }}>Generate Implementation Suggestions ↗</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 15 }}>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>Filter:</span>
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "⚠ Not Deliberated" },
          { key: "deliberated", label: "✓ Deliberated" },
          { key: "approved", label: "★ In Manifest" },
          { key: "rejected", label: "✗ Not Proceeding" },
        ].map((f) => (
          <button key={f.key} className={`btn btn-gh btn-sm`} onClick={() => setFilter(f.key)}
            style={{ borderColor: filter === f.key ? "var(--bright)" : "var(--border)", color: filter === f.key ? "var(--white)" : "var(--muted)" }}>
            {f.label}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)", fontFamily: "var(--fm)" }}>{filtered.length} insight{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 50, color: "var(--muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>💡</div>
            <div style={{ fontFamily: "var(--fd)", fontSize: 14, color: "var(--silver)", marginBottom: 6 }}>
              {filter === "all" ? "No insights logged yet" : "No insights matching this filter"}
            </div>
          </div>
        ) : (
          filtered.map((ins) => {
            const isAuthor = ins.addedByUid === session?.uid;
            const canDelib = !locked && ins.status === "pending" && (isAdmin || isAuthor);
            const canApprove = isAdmin && ins.status === "deliberated";
            const canReject = isAdmin && ins.status === "deliberated";
            const canDelete = isAdmin && ins.status !== "approved";

            return (
              <div key={ins.id} className="ins-card">
                <div className="ins-head">
                  <div className="ins-phase-tag">{ins.phase || "General"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ins-title">{ins.book} <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>— {ins.author || ""}</span></div>
                    <div className="ins-chapter">{ins.chapter} · {ins.category || ""}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
                    <span className={`chip ${statusClasses[ins.status] || "cw"}`}><span className="chip-dot"></span>{statusChips[ins.status] || ""}</span>
                    <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--fm)" }}>{ins.addedBy || ""} · {ins.date || ""}</span>
                  </div>
                </div>

                <div className="ins-body">
                  <div className="ins-notes">
                    <strong style={{ color: "var(--silver)", fontSize: 12 }}>Reading Notes:</strong><br />{ins.notes}
                  </div>

                  {(ins.suggestions || []).length > 0 && (
                    <div className="sug-box">
                      <div className="sug-label">Implementation Suggestions for Phantix</div>
                      {ins.suggestions.map((s: string, i: number) => (
                        <div key={i} className="sug-item"><span className="sug-bull">→</span><span>{s}</span></div>
                      ))}
                    </div>
                  )}

                  {ins.verdict && (
                    <div className="verdict-box">
                      <div className="verdict-lbl">Final Verdict / Deliberation Notes</div>
                      <div className="verdict-txt">{ins.verdict}</div>
                      {ins.deliberatedBy && (
                        <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--fm)", marginTop: 5 }}>By {ins.deliberatedBy} · {ins.deliberatedDate || ""}</div>
                      )}
                    </div>
                  )}

                  <div className="ins-actions" style={{ marginTop: 10 }}>
                    {canDelib && <button className="btn btn-wn btn-sm" onClick={() => toggleDelibForm(ins.id)}>⚑ Mark as Deliberated</button>}
                    {canApprove && <button className="btn btn-pu btn-sm" onClick={() => approveInsight(ins.id)}>★ Add to Manifest</button>}
                    {canReject && <button className="btn btn-dd btn-sm" onClick={() => rejectInsight(ins.id)}>✗ Not Proceeding</button>}
                    {canDelete && <button className="btn btn-dd btn-sm" onClick={() => delInsight(ins.id)} style={{ marginLeft: "auto" }}>Delete</button>}
                  </div>

                  {canDelib && (
                    <div className="delib-form" id={`df-${ins.id}`} style={{ display: "none" }}>
                      <div style={{ fontSize: 9, color: "var(--muted)", fontFamily: "var(--fm)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Deliberation Notes / Final Verdict</div>
                      <textarea className="ifield" id={`dn-${ins.id}`} style={{ minHeight: 70 }} placeholder="Record what was discussed and agreed."></textarea>
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button className="btn btn-ok btn-sm" onClick={() => confirmDelib(ins.id)}>Confirm Deliberation</button>
                        <button className="btn btn-gh btn-sm" onClick={() => toggleDelibForm(ins.id)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
