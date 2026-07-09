import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthToken, requireAdmin, errorResponse, jsonResponse } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  if (!requireAdmin(user)) return errorResponse("Admin access required", 403);

  try {
    const batch = adminDb.batch();

    const defaultRisks = [
      { title: "Seed funding not secured before MVP build", category: "Financial", level: "HIGH", mitigation: "Pursue cloud credits + accelerators. Bootstrap MVP.", owner: "Founder" },
      { title: "AI API costs scale faster than revenue", category: "Technical", level: "MEDIUM", mitigation: "Aggressive caching, prompt compression, cost alerts.", owner: "Engineering" },
      { title: "SME digital literacy lower than modeled", category: "Market", level: "MEDIUM", mitigation: "UX research with real users. Guided setup for pilots.", owner: "Product" },
      { title: "NDPA enforcement triggers compliance spike", category: "Regulatory", level: "LOW", mitigation: "Monitor NDPC. Position compliance as primary GTM hook.", owner: "Founder" },
    ];
    for (const r of defaultRisks) {
      batch.set(adminDb.collection("risks").doc(), { ...r, createdAt: new Date() });
    }

    const defaultMilestones = [
      { title: "Project Initiation", date: "2026-05", desc: "Pre-dev manifest and planning docs complete.", status: "done" },
      { title: "Pre-Dev Documents Complete", date: "2026-07", desc: "All 16 pre-dev documents drafted.", status: "pending" },
      { title: "Architecture Finalized", date: "2026-08", desc: "System architecture, threat model, AI governance.", status: "pending" },
      { title: "Engineering Kickoff", date: "2026-09", desc: "Repo live, CI/CD running, team onboarded.", status: "pending" },
      { title: "MVP Alpha", date: "2026-11", desc: "Core scanning engine operational.", status: "pending" },
      { title: "MVP Launch", date: "2026-12", desc: "10 pilot SME customers onboarded.", status: "pending" },
      { title: "First Paying Customer", date: "2027-01", desc: "Non-pilot subscription live.", status: "pending" },
      { title: "100 Customers", date: "2027-04", desc: "₦18M ARR run-rate.", status: "pending" },
      { title: "Phase 2 Launch", date: "2027-06", desc: "Endpoint agent and SIEM-lite live.", status: "pending" },
      { title: "500 Customers", date: "2027-10", desc: "₦100M ARR. Series A prep.", status: "pending" },
      { title: "Phase 3 Launch", date: "2028-02", desc: "AI SOC live. MSSP console operational.", status: "pending" },
      { title: "2-Year Delivery Complete", date: "2028-05", desc: "Full platform. 2,000+ customers. Series A.", status: "pending" },
    ];
    for (const m of defaultMilestones) {
      batch.set(adminDb.collection("milestones").doc(), { ...m, createdAt: new Date() });
    }

    const defaultLogs = [
      { type: "milestone", text: "Project initiated. Pre-Development Manifest v0.1 complete.", date: "2026-05-09", author: "System" },
      { type: "doc", text: "5 core documents completed and branded as Phantix Security.", date: "2026-05-09", author: "System" },
      { type: "update", text: "Command Centre deployed with Firebase Admin auth + Firestore.", date: "2026-05-09", author: "System" },
    ];
    for (const l of defaultLogs) {
      batch.set(adminDb.collection("logs").doc(), { ...l, createdAt: new Date() });
    }

    const defaultMvpItems = [
      { title: "Organization Setup + Identity Verification", description: "Email + phone OTP + basic details + optional RC/CAC. Clear privacy + no-exfiltration messaging.", priority: "P1", category: "Onboarding", status: "pending" },
      { title: "Guided Database Connection Wizard", description: "Step-by-step for customer dedicated DB server connected only to Phantix application layer. Test connection + architecture diagram.", priority: "P1", category: "Onboarding", status: "pending" },
      { title: "Request Setup Assistance flow", description: "WhatsApp, call, or guided playbook during onboarding.", priority: "P2", category: "Onboarding", status: "pending" },
      { title: "Asset Discovery & Inventory", description: "Auto + manual discovery (networks, domains, web services, APIs, GitHub). Stored on customer DB via app layer.", priority: "P1", category: "Core", status: "pending" },
      { title: "Core VAPT Engine (Nmap + Nuclei + OpenVAS)", description: "Orchestrated authenticated/unauthenticated scans. All tooling hosted in Phantix cloud.", priority: "P1", category: "Security", status: "pending" },
      { title: "Burp Suite Integration (MCP)", description: "Cloud-hosted Burp Pro via MCP. Local dir on customer side, auto cleanup, artifacts only to customer DB via app layer.", priority: "P1", category: "Security", status: "pending" },
      { title: "AI Finding Analysis + Remediation Guidance", description: "Risk prioritization by exploitability + business impact. Plain-language guidance. Runs in Phantix cloud. No exfil.", priority: "P1", category: "Security", status: "pending" },
      { title: "NDPA-first Compliance Dashboard", description: "Primary view for NDPA 2023 + mapping to NIST CSF 2.0. Posture score, gap analysis, trending, risk register.", priority: "P1", category: "Compliance", status: "pending" },
      { title: "Audit-ready Evidence Pack Generation", description: "One-click packs stored on customer’s server via application layer.", priority: "P2", category: "Compliance", status: "pending" },
      { title: "Command Centre Dashboard & Reporting", description: "Unified mobile-friendly report viewer. Prioritized findings, posture trends, remediation checklists, PDF/Excel export.", priority: "P1", category: "Core", status: "pending" },
      { title: "Initiator + Authorizer Workflows", description: "User management, roles/permissions, explicit approval for scans, remediation, phishing.", priority: "P2", category: "Core", status: "pending" },
      { title: "Phishing Campaign Module (MVP Lite)", description: "Template import, target lists, simulation execution, results to customer DB, basic reporting.", priority: "P2", category: "Security", status: "pending" },
      { title: "GitHub Integration", description: "Source code reviews + secret/dependency scanning. Findings to customer DB via app layer.", priority: "P3", category: "Security", status: "pending" },
      { title: "Notifications (Email + WhatsApp + SMS)", description: "Alerts and in-app support request flow with consistent setup assistance messaging.", priority: "P2", category: "UX", status: "pending" },
      { title: "Hybrid Architecture Foundations + No-Exfiltration", description: "Audit logging for all app-layer DB interactions. Explicit guarantees in UI and docs.", priority: "P1", category: "Infra", status: "pending" },
      { title: "Regulatory Prerequisites (NDPA/NDPR, NITDA, FCCPC)", description: "Complete compliance program, NITDA partnership, approvals before client onboarding or funding.", priority: "P1", category: "Regulatory", status: "pending" },
      { title: "End-to-end first-value flow testing", description: "Validate with Nigerian SME persona: setup ≤20min, first scan + understanding risks ≤60min.", priority: "P2", category: "Core", status: "pending" },
    ];
    for (const m of defaultMvpItems) {
      batch.set(adminDb.collection("mvp").doc(), { ...m, addedBy: "System", createdAt: new Date() });
    }

    await batch.commit();
    return jsonResponse({ ok: true, message: "Default data seeded successfully." });
  } catch (err: any) {
    console.error("[/api/admin/seed]", err.message);
    return errorResponse(err.message, 500);
  }
}
