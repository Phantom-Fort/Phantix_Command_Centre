export interface BookInfo {
  t: string;
  a: string;
}

export interface BookSection {
  phase: string;
  books: BookInfo[];
}

export interface ArchService {
  n: string;
  ic: string;
  d: string;
  tasks: string[];
}

export interface FlatBook extends BookInfo {
  phase: string;
}

export const BOOKS: BookSection[] = [
  {
    phase: "Phase 1 — Security Foundations",
    books: [
      { t: "Security Engineering", a: "Ross Anderson" },
      { t: "Zero Trust Networks", a: "Evan Gilman & Doug Barth" },
      { t: "The Cybersecurity Playbook", a: "Allison Cerra" },
      { t: "The Practice of Network Security Monitoring", a: "Richard Bejtlich" },
      { t: "Blue Team Handbook", a: "Don Murdoch" },
      { t: "Practical Malware Analysis", a: "Michael Sikorski" },
    ],
  },
  {
    phase: "Phase 2 — Offensive Security",
    books: [
      { t: "The Web Application Hacker's Handbook", a: "Stuttard & Pinto" },
      { t: "Penetration Testing", a: "Georgia Weidman" },
      { t: "The Hacker Playbook 3", a: "Peter Kim" },
      { t: "Real-World Bug Hunting", a: "Peter Yaworski" },
      { t: "API Security in Action", a: "Neil Madden" },
      { t: "Black Hat Python", a: "Justin Seitz" },
    ],
  },
  {
    phase: "Phase 3 — AI & ML Engineering",
    books: [
      { t: "Hands-On Machine Learning (Scikit-Learn, Keras, TF)", a: "Aurélien Géron" },
      { t: "Building LLM Powered Applications", a: "Valentina Alto" },
      { t: "AI and Machine Learning for Coders", a: "Laurence Moroney" },
      { t: "Designing Machine Learning Systems", a: "Chip Huyen" },
      { t: "AI Engineering", a: "Chip Huyen" },
    ],
  },
  {
    phase: "Phase 4 — Systems Architecture",
    books: [
      { t: "Designing Data-Intensive Applications", a: "Martin Kleppmann" },
      { t: "Building Microservices", a: "Sam Newman" },
      { t: "The DevOps Handbook", a: "Kim, Humble, Debois & Willis" },
      { t: "Site Reliability Engineering", a: "Google" },
      { t: "Clean Architecture", a: "Robert C. Martin" },
    ],
  },
  {
    phase: "Phase 5 — Cloud & Infrastructure",
    books: [
      { t: "Kubernetes Up and Running", a: "Kelsey Hightower" },
      { t: "Cloud Native DevOps with Kubernetes", a: "Various" },
      { t: "Terraform Up and Running", a: "Yevgeniy Brikman" },
    ],
  },
  {
    phase: "Phase 6 — Product & Business",
    books: [
      { t: "The Mom Test", a: "Rob Fitzpatrick" },
      { t: "Crossing the Chasm", a: "Geoffrey Moore" },
      { t: "Zero to One", a: "Peter Thiel" },
      { t: "The Lean Startup", a: "Eric Ries" },
      { t: "Inspired", a: "Marty Cagan" },
      { t: "Obviously Awesome", a: "April Dunford" },
    ],
  },
];

export const ALL_BOOKS: FlatBook[] = BOOKS.flatMap((s) =>
  s.books.map((b) => ({ ...b, phase: s.phase }))
);

const SUGG: Record<string, string[]> = {
  "Security Engineering": [
    "Apply layered defence — no single control should be the last line of protection",
    "Implement Saltzer & Schroeder principles: least privilege, fail-safe defaults, complete mediation",
    "Treat all network segments as hostile — internal and external traffic deserve equal scrutiny",
    "Build security logging as a first-class system requirement, not an afterthought",
    "Implement audit trails with cryptographic integrity verification for all critical actions",
  ],
  "Zero Trust Networks": [
    "Identity-based access controls across all services — no implicit trust from network location",
    "API gateway must enforce continuous auth and authorisation on every request, not just at login",
    "Micro-segment the scanning infrastructure from customer data stores",
    "Implement mutual TLS between all internal Phantix services",
    "Build device trust evaluation in the endpoint agent — posture-based access decisions",
  ],
  "The Cybersecurity Playbook": [
    "Design executive-level dashboards for non-technical SME operators — business language, not log lines",
    "Build a risk communication framework that translates CVSS scores into plain business impact",
    "Implement a security awareness module that communicates risk without jargon",
    "Create a security programme roadmap feature showing customers where they are vs where they need to be",
  ],
  "The Practice of Network Security Monitoring": [
    "Structure alert data with full context: source, destination, protocol, payload summary, timestamp",
    "Build a visibility matrix per customer — known assets, monitored zones, detection gaps",
    "Implement traffic baselining so the alert engine flags statistical anomalies, not just signatures",
    "Store network evidence (netflow, pcap) with configurable retention for incident reconstruction",
  ],
  "Blue Team Handbook": [
    "Build structured IR playbooks — each alert type maps to a specific response workflow",
    "Implement network segmentation recommendations as part of remediation guidance output",
    "Create a threat hunt query library aligned to MITRE ATT&CK techniques",
    "Design a security operations runbook for SME IT admins with no prior SOC experience",
  ],
  "Practical Malware Analysis": [
    "Build a static analysis module checking files against known malware indicators before execution",
    "Implement behavioural IOC tracking — go beyond hash matching to pattern-based detection",
    "Design the endpoint agent to detect common persistence mechanisms: registry keys, scheduled tasks, startup items",
    "Build YARA rule integration for custom malware detection in the scanning engine",
  ],
  "The Web Application Hacker's Handbook": [
    "Build a web vulnerability scanner covering OWASP Top 10 as the core capability",
    "Implement authentication testing: brute force detection, credential stuffing, session fixation checks",
    "Add injection testing: SQL, NoSQL, LDAP, and command injection",
    "Build CSRF and clickjacking detection for all scanned web applications",
    "Add subdomain takeover detection as a high-priority scan module for SME web assets",
  ],
  "Penetration Testing": [
    "Structure scanner output as a pentest-style report: executive summary, findings, remediation steps",
    "Build a scoped, permissioned assessment mode — customers explicitly define what gets scanned",
    "Implement reconnaissance module: passive DNS, WHOIS, certificate transparency logs, exposure mapping",
    "Design a controlled internal scan mode for customers running the agent on their own infrastructure",
  ],
  "The Hacker Playbook 3": [
    "Model the full attack chain view — map findings across initial access, persistence, lateral movement, exfiltration",
    "Build Red Team scenario templates for customers to use testing their own defences",
    "Implement living-off-the-land technique detection in the endpoint agent",
    "Map all findings to MITRE ATT&CK technique IDs in the report output",
  ],
  "API Security in Action": [
    "Build dedicated API security scanning: rate limit testing, auth bypass checks, BOLA/BFLA detection",
    "Implement JWT validation testing — weak algorithms, expiry bypass, algorithm confusion attacks",
    "Design the Phantix API gateway with capability-based tokens, not just role-based access",
    "Add OAuth flow security testing to the web vulnerability scan module",
  ],
  "Real-World Bug Hunting": [
    "Build a bug bounty-style vulnerability report template with full reproduction steps for each finding",
    "Implement business logic vulnerability heuristics — not just CVE matches",
    "Design a customer-facing vulnerability disclosure portal for responsible reporting",
  ],
  "Black Hat Python": [
    "Build a Python-based packet capture module for the endpoint agent — lightweight and portable",
    "Implement a custom Python network scanner for asset discovery behind firewalls",
    "Create a Python-based credential-in-file scanner for hardcoded secrets detection",
  ],
  "Hands-On Machine Learning (Scikit-Learn, Keras, TF)": [
    "Train a local anomaly detection model on customer network traffic baselines using IsolationForest",
    "Build an alert severity classification model trained on historical alert outcomes",
    "Implement a neural network for malware file classification using static features",
    "Use clustering to group similar vulnerabilities and reduce alert noise",
  ],
  "Building LLM Powered Applications": [
    "Implement RAG architecture for the AI analysis engine — retrieve relevant CVE and threat intel before generating findings",
    "Build a multi-step AI agent for incident investigation: plan → gather evidence → analyse → recommend",
    "Use structured output (JSON schema) for all LLM responses to ensure parseable, validated findings",
    "Implement conversation memory for the AI SOC assistant — maintain investigation context across turns",
    "Build a tool-use agent that queries internal security data stores to enrich LLM analysis",
  ],
  "Designing Machine Learning Systems": [
    "Design the ML pipeline with data validation at every stage — garbage in, garbage predictions",
    "Implement model monitoring — track prediction drift and trigger retraining when accuracy degrades",
    "Build separate feature pipelines for online (real-time) and batch (scheduled scan) inference",
    "Document model cards for every deployed ML model — inputs, outputs, limitations, bias considerations",
  ],
  "AI Engineering": [
    "Build an evaluation harness for every AI task — measure quality, latency, and cost on representative samples",
    "Implement prompt versioning — treat system prompts as code with tests, review process, and rollback capability",
    "Design the AI layer with LLM provider abstraction — swap models without changing application logic",
    "Build an LLM observability layer — log every prompt, response, latency, and token count",
    "Implement guardrails for AI output — schema validation, content filtering, hallucination detection",
  ],
  "AI and Machine Learning for Coders": [
    "Prototype the anomaly detection model in TensorFlow Lite for the endpoint agent — offline inference",
    "Build a transfer learning pipeline for security domain adaptation of general LLMs",
    "Implement a simple confidence scoring system for AI-generated findings",
  ],
  "Designing Data-Intensive Applications": [
    "Design scan result storage with event sourcing — every scan is an immutable event, never overwritten",
    "Implement change data capture (CDC) for the asset inventory — track asset state changes over time",
    "Build the alert pipeline as a stream processing system — Kafka topics for real-time alert delivery",
    "Use CQRS to separate write-heavy scan ingestion from the read-heavy dashboard path",
    "Design for eventual consistency in the compliance engine — compliance status is computed, not stored",
  ],
  "Building Microservices": [
    "Define service boundaries by business capability: Scan, Alert, Compliance, Asset, Notification as separate services",
    "Implement the strangler fig pattern for future refactoring — new capabilities wrap old ones gradually",
    "Build the API gateway as the single entry point — handle auth, rate limiting, and routing centrally",
    "Use async messaging between services for non-critical paths — email notifications, report generation",
  ],
  "The DevOps Handbook": [
    "Implement continuous security testing in CI/CD — SAST, dependency scanning, container image scanning in every pipeline",
    "Build blue-green deployment pipelines for zero-downtime scan engine updates",
    "Create runbooks for every production incident class — same documentation discipline as security operations",
    "Implement feature flags for gradual rollout of new scanning modules to pilot customers",
  ],
  "Site Reliability Engineering": [
    "Define SLOs for every customer-facing capability: scan completion rate, dashboard availability, alert latency",
    "Implement error budgets — SLO degradation freezes new feature development until reliability is restored",
    "Build a toil reduction programme — every manual operational task running 2+ times per week gets automated",
    "Design distributed tracing from day one — every scan job traceable from trigger to result delivery",
  ],
  "Clean Architecture": [
    "Implement the dependency rule strictly — business logic must have zero dependency on frameworks or databases",
    "Build the scan orchestrator as a pure domain model — no FastAPI, no database calls in the core logic layer",
    "Define use case interactors for every business operation — explicit, testable, and framework-independent",
    "Separate the vulnerability database adapter from the scanning logic — swap CVE sources without touching the engine",
  ],
  "Kubernetes Up and Running": [
    "Deploy each service as a separate Kubernetes Deployment with independent scaling policies",
    "Use Kubernetes Secrets with external secret management (AWS Secrets Manager / HashiCorp Vault) — no baked-in secrets",
    "Implement pod disruption budgets for the scan orchestrator — maintain scanning capacity during node maintenance",
    "Build Kubernetes-native health checks — readiness and liveness probes for every service",
  ],
  "Terraform Up and Running": [
    "Define all cloud infrastructure as Terraform modules — reproducible, version-controlled environments",
    "Implement Terraform workspaces for dev, staging, and production environment isolation",
    "Build a Terraform module for customer tenant provisioning — onboard a new SME with a single plan/apply",
    "Use remote state with locking — never allow concurrent infrastructure modifications",
  ],
  "Cloud Native DevOps with Kubernetes": [
    "Implement GitOps for deployment — the cluster state is always derivable from the Git repository",
    "Build immutable infrastructure — no SSH access to production, all changes go through the pipeline",
    "Use Kubernetes NetworkPolicies to implement zero-trust networking between scan services",
  ],
  "The Mom Test": [
    "Build the SME onboarding flow around discovery of their actual problem, not demonstration of features",
    "Design pilot customer interviews around what security failures have already cost them — not hypothetical risk",
    "Instrument the dashboard to track what customers actually use vs ignore — kill ignored features ruthlessly",
    "Create a feedback loop from every customer support ticket directly into the product backlog",
  ],
  "Crossing the Chasm": [
    "Target Nigerian fintech SMEs as the beachhead segment — highest pain and clearest willingness to pay",
    "Build a complete whole product for the beachhead before expanding — scanning + remediation + compliance, not just scanning",
    "Find a reference customer in the beachhead — one fintech that becomes the case study for crossing into adjacent segments",
    "Design early adopter pricing differently from mainstream market pricing",
  ],
  "Zero to One": [
    "Build a proprietary African threat intelligence dataset — no one else will invest in this for this market",
    "Design for a 10x better experience than no security at all — that is the actual competitive baseline for most SMEs",
    "Create network effects — shared threat intelligence across customers makes the platform better with each new customer",
  ],
  "The Lean Startup": [
    "Define the single metric that matters for the MVP: time from signup to first actionable security finding",
    "Build a build-measure-learn loop into the scan engine — every scan generates data on what customers do with findings",
    "Implement cohort analysis — track what percentage of week-1 customers are still active in week-8",
  ],
  "Inspired": [
    "Run customer discovery with Nigerian IT admins before writing a single line of dashboard code",
    "Build a product trio for each major feature: PM defines outcome, designer defines experience, engineer defines feasibility",
    "Measure outcomes, not output — not how many features shipped, but whether customers are measurably more secure",
  ],
  "Obviously Awesome": [
    "Position Phantix as the first line of defence — not a monitoring tool, but an active defence layer",
    "Design positioning around the AI-powered security copilot category — a genuinely new category in the Nigerian market",
    "Build the marketing narrative around what Phantix makes possible, not what it technically does",
  ],
};

export function getSuggestions(book: string, notes: string): string[] {
  const base = SUGG[book] || [
    "Apply the core concepts from this reading to the Phantix scanning engine architecture",
    "Extract security principles and document them in the Security Philosophy document",
    "Identify frameworks or methodologies applicable to the AI analysis engine reasoning patterns",
    "Consider how the author's approach maps to the SME security context in emerging markets",
  ];

  const n = (notes || "").toLowerCase();
  const extra: string[] = [];

  if (n.includes("trust")) extra.push("Apply trust hierarchy principles to the API gateway authentication model");
  if (n.includes("monitor")) extra.push("Enhance the telemetry pipeline with the monitoring patterns described in this chapter");
  if (n.includes("agent") || n.includes("autonom")) extra.push("Design the AI agent with explicit tool boundaries — no unconstrained autonomous action");
  if (n.includes("log")) extra.push("Structure the log schema based on the logging best practices from this chapter");
  if (n.includes("api")) extra.push("Apply the API security principles described to the Phantix REST API design specification");
  if (n.includes("scale")) extra.push("Model the horizontal scaling strategy based on the patterns described");
  if (n.includes("customer") || n.includes("user")) extra.push("Document this user insight in the UX research file and reference it in onboarding design decisions");
  if (n.includes("attack") || n.includes("threat")) extra.push("Add the attack patterns described to the Phantix threat model document");
  if (n.includes("compli")) extra.push("Map the compliance framework described to the Phantix compliance engine module");
  if (n.includes("prompt") || n.includes("llm")) extra.push("Apply the prompt engineering pattern described to the AI analysis engine system prompt architecture");

  return [...base.slice(0, 4), ...extra.slice(0, 3)];
}

export const ARCH_SERVICES: ArchService[] = [
  {
    n: "Scan Orchestrator",
    ic: "\uD83D\uDD0D",
    d: "Manages scan jobs, dispatches tasks, wraps Nmap/Nuclei/OpenVAS.",
    tasks: [
      "Define scan job data model",
      "Design message queue schema",
      "Document Nmap integration spec",
      "Document Nuclei template strategy",
      "Define scan result schema",
      "Plan SSRF controls and scan target validation",
    ],
  },
  {
    n: "AI Analysis Engine",
    ic: "\uD83E\uDDE0",
    d: "Produces prioritised plain-language findings via LLM API.",
    tasks: [
      "Define prompt architecture",
      "Design finding prioritization schema",
      "Plan hallucination mitigation strategy",
      "Define LLM provider abstraction interface",
      "Design prompt injection controls",
      "Define evaluation suite structure",
    ],
  },
  {
    n: "Asset Manager",
    ic: "\uD83D\uDCE1",
    d: "Maintains asset inventory — networks, domains, IPs, endpoints.",
    tasks: [
      "Define asset data model",
      "Plan asset discovery flow",
      "Design subdomain enumeration approach",
      "Define asset tagging schema",
      "Plan multi-tenant data isolation",
    ],
  },
  {
    n: "Alert Engine",
    ic: "\uD83D\uDD14",
    d: "Deduplication, correlation, suppression, routing.",
    tasks: [
      "Define alert severity taxonomy",
      "Design deduplication logic",
      "Plan correlation rules engine",
      "Define suppression rules",
      "Design alert routing configuration",
    ],
  },
  {
    n: "Compliance Engine",
    ic: "\uD83D\uDCCB",
    d: "Maps posture to NDPA 2023, NIST CSF 2.0, ISO 27001.",
    tasks: [
      "Map NDPA 2023 control set",
      "Map NIST CSF 2.0 controls",
      "Design gap report schema",
      "Plan evidence collection model",
      "Define compliance scoring logic",
    ],
  },
  {
    n: "API Gateway",
    ic: "\u26A1",
    d: "FastAPI gateway: auth, rate limiting, request routing.",
    tasks: [
      "Define API spec (OpenAPI)",
      "Design RBAC model",
      "Plan JWT + MFA auth flow",
      "Define rate limiting strategy",
      "Document API versioning policy",
    ],
  },
  {
    n: "Dashboard Frontend",
    ic: "\uD83D\uDDA5",
    d: "React + TypeScript security operations dashboard.",
    tasks: [
      "Design information architecture",
      "Create component library plan",
      "Define data visualization strategy",
      "Plan WebSocket real-time updates",
      "Define accessibility requirements",
    ],
  },
  {
    n: "Notification Service",
    ic: "\uD83D\uDCE8",
    d: "Email, in-app, webhook, digest scheduling.",
    tasks: [
      "Define notification trigger taxonomy",
      "Design digest schedule logic",
      "Plan email template system",
      "Define webhook payload schema",
    ],
  },
];

export const PROJECT_START = new Date("2026-05-09");
export const PROJECT_END = new Date("2028-05-09");
export const LOCK_END = new Date("2026-11-09");

export const PAGE_TITLES: Record<string, string> = {
  overview: "Command Centre — Overview",
  phases: "Phases & Deliverables",
  documents: "Document Registry",
  research: "Research Tracker",
  insights: "Book Insights & Deliberation",
  manifest: "Implementation Manifest",
  architecture: "Architecture Tracker",
  milestones: "Key Milestones",
  risks: "Risk Register",
  log: "Activity Log",
  brand: "Brand Kit",
};
