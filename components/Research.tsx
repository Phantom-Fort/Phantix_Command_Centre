"use client";

import { useMemo } from "react";
import { useApp } from "@/hooks/useAppData";
import { BOOKS } from "@/lib/data";
import { setState } from "@/lib/api-client";

export default function Research() {
  const { booksRead, dispatch } = useApp();

  const { total, read, pct } = useMemo(() => {
    let t = 0;
    let r = 0;
    BOOKS.forEach((section, si) => {
      section.books.forEach((_, bi) => {
        t++;
        if (booksRead[`${si}-${bi}`]) r++;
      });
    });
    return { total: t, read: r, pct: t ? Math.round((r / t) * 100) : 0 };
  }, [booksRead]);

  const toggleBook = async (key: string) => {
    dispatch({ type: "TOGGLE_BOOK_READ", payload: key });
    try {
      await setState("booksRead", { ...booksRead, [key]: !booksRead[key] });
    } catch (err: any) {
      dispatch({ type: "TOGGLE_BOOK_READ", payload: key });
      console.error("[Research] toggleBook save failed:", err.message);
    }
  };

  return (
    <div className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">Research Tracker</div>
          <div className="section-line"></div>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)" }}>Click books to mark as read</div>
      </div>

      <div className="kpi3 mb20">
        <div className="card">
          <div className="card-label">Books Read</div>
          <div className="card-value green">{read}</div>
          <div className="card-sub">of <span>{total}</span> total</div>
        </div>
        <div className="card">
          <div className="card-label">Research Domains</div>
          <div className="card-value cyan">9</div>
        </div>
        <div className="card">
          <div className="card-label">Reading Progress</div>
          <div className="card-value">{pct}%</div>
          <div style={{ marginTop: 7 }}>
            <div className="bar-track"><div className="bar-fill g" style={{ width: pct + "%" }}></div></div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 13 }}>
        {BOOKS.map((section, si) => (
          <div key={si} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: 13 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "var(--cyan)", fontFamily: "var(--fm)", textTransform: "uppercase", marginBottom: 9 }}>
              {section.phase}
            </div>
            {section.books.map((book, bi) => {
              const key = `${si}-${bi}`;
              const isRead = !!booksRead[key];
              return (
                <div key={bi}
                  style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 0", borderBottom: "1px solid var(--border2)", cursor: "pointer" }}
                  onClick={() => toggleBook(key)}
                >
                  <div style={{
                    width: 14, height: 14, borderRadius: 3, flexShrink: 0, marginTop: 1,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: `1.5px solid ${isRead ? "var(--success)" : "var(--muted)"}`,
                    background: isRead ? "var(--success)" : "transparent",
                    transition: "all 0.15s",
                  }}>
                    {isRead && <span style={{ color: "white", fontSize: 8, fontWeight: 700 }}>&#10003;</span>}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: isRead ? "var(--muted)" : "var(--silver)", textDecoration: isRead ? "line-through" : "none", lineHeight: 1.4 }}>
                      {book.t}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>{book.a}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
