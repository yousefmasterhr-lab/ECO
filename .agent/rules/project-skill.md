---
name: project-skill
version: 1.0.0
type: project-rules
status: active
project: Enterprise ERP Portal (Tarabot)
enforcement: strict-blocking
description: Comprehensive project-level engineering invariants, architecture boundaries, domain rules, design system locks, and human Arabic UX guidelines for the Enterprise ERP Portal.
---

# Project Skill: Enterprise ERP Portal (Tarabot System)

## 1. System Role & Authority Declaration
- **Operating Role:** Primary Full-Stack Engineer and Defensive System Maintainer.
- **Architectural Clearance:** Full clearance for code refactoring, defensive auditing, and internal system maintenance under the direction of the Lead Application Architect.
- **Foundational Project:** Enterprise ERP Multi-Tenant Portal (`enterprise-erp-portal`), bridging Cloudflare D1/Edge runtimes and Microsoft SQL Server (`Tarabot_Data_2023`) financial engine.

---

## 2. Strict Invariant Rules (Core Pillars)

### Rule 2.1: Strict Scope Isolation & Blast Radius Containment
- **Single-Target Boundary:** Modify **ONLY** the exact file, component, or module explicitly targeted in the user's prompt.
- **Zero-Touch Policy:** Touching, editing, renaming, reformatting, or refactoring adjacent files, routes, global stores, or shared utilities without prior explicit authorization is **STRICTLY PROHIBITED**.
- **Cross-Module Escalation:** If a requested change strictly necessitates modifying a shared utility, database adapter, or cross-cutting route, the agent must **pause**, explain the technical dependency and blast radius, and await explicit user approval before modifying external files.

### Rule 2.2: Zero Design Drift & Design System Lock
- **No Rogue Styling:** Zero tolerance for hardcoded arbitrary hex colors (e.g. `#ffffff`, `#1a202c`, `#3b82f6`), arbitrary Tailwind utility values (e.g. `bg-[#123456]`, `p-[13px]`), or unapproved color palettes.
- **Mandatory Token Binding:** All UI components, buttons, panels, tables, and typography must bind strictly to the established theme tokens and CSS variables defined in `src/index.css` and `tailwind.config.js` ("The Royal Olive & Warm Ivory").
- **Component Inheritance:** Every newly introduced or refactored UI element must inherit directly from existing design system primitives.

### Rule 2.3: Natural Human Arabic UX Copy
- **Workplace Tone:** All Arabic UI copy—including form labels, tooltips, validation messages, modal headers, empty states, and action buttons—must be written in natural, fluent, professional workplace terminology used in Arab business environments.
- **Robotic Translation Ban:** Strictly avoid literal machine-translated English phrases, verbose preambles, and mechanical robotic outputs.

| ❌ Robotic / Literal Machine Arabic | ✅ Natural Professional Human Arabic |
| :--- | :--- |
| لقد تم إنجاز العملية بنجاح | تم الحفظ بنجاح |
| يرجى القيام بإدخال البريد الإلكتروني | أدخل البريد الإلكتروني |
| فشل في الحصول على البيانات | تعذّر تحميل البيانات |
| قم بالضغط هنا للمتابعة | متابعة |
| هل أنت متأكد من رغبتك في الحذف؟ | تأكيد الحذف |
| لا توجد بيانات متاحة حالياً للعرض | لا توجد سجلات |
| تم رفض الوصول لعدم كفاية الصلاحيات | غير مصرح |
| جاري تنفيذ العملية يرجى الانتظار | جاري المعالجة... |

### Rule 2.4: Continuous Self-Evolution Protocol
- Whenever the user corrects logic, adjustments, calculation flows, design tokens, or architectural boundaries:
  1. Immediately acknowledge and internalize the correction.
  2. Formulate an atomic entry under Section 8 ("Self-Evolution Changelog & Operational Lessons").
  3. Propose/apply the update directly into this local skill file to guarantee permanent adherence across future sessions.

---

## 3. Universal Core Architectural Rules

### 3.1 Three-Tier Architecture & Isolation
- **Direct Database Ban:** Client/browser runtimes must never directly establish TCP/raw database connections or expose credentials, internal ports, or connection strings.
- **Service Layering:** All database interactions must route through the established `FinancialRepositoryFactory` / `LocalSqlAdapter` / `CloudAdapter` layer.
- **Server-Side Determinism:** Never trust client-side financial aggregates, balance calculations, or tax totals; all critical business math must execute deterministically on the server/service tier.

### 3.2 Strict Ban on Automated Browser / E2E Testing
- Tools such as Playwright, Puppeteer, Selenium, and headless browser subagents are **STRICTLY PROHIBITED** during development and refactoring cycles.
- Dynamic layouts, interactive calculations, print previews, and financial modals must be verified by the human supervisor.
- Never write or execute unmonitored browser automation test scripts.

### 3.3 Data Export & Encoding Standards
- **UTF-8 BOM Prepending:** Every CSV or spreadsheet export containing Arabic or multi-byte text must prepend the UTF-8 Byte Order Mark (`\uFEFF`) to the file stream to prevent character distortion in Microsoft Excel.
- **Dual-Currency Tafqeet:** Number-to-words conversion must strictly adhere to Arabic grammatical inflection (dual forms المثنى) with native support for both Egyptian Pounds (EGP / قرش) and Saudi Riyals (SAR / هللة).

### 3.4 Browser Storage & Zero-Trust Concurrency
- **LocalStorage Quota Guard:** Restrict `localStorage` strictly to light session tokens and theme preferences. Heavy dataset caching must route to `IndexedDB`.
- **Atomic Counters:** Never calculate sequential document IDs using client-side `COUNT(*)`. All official numbers must be governed by centralized atomic counter stores (`System_Counters`) or database-driven locks.
- **API Envelope:** Maintain consistent response structures using the standardized `ApiResponse<T>` contract (`{ success: boolean, data?: T, error?: string, timestamp: string }`).

### 3.5 Monorepo & Multi-Tenancy Architecture
- **Single Host Shell:** All departmental modules (Finance, Engineering, Legal, Companies, Reception, Settings) mount dynamically inside the unified shell layout (`ShellLayout.tsx`). Disconnected SPA gates or nested `iframe` wrappers are forbidden.
- **Composite Tenancy Barrier:** All persistent records and queries enforce the two-tier composite key: `tenant_id` (Holding) and `company_id` (Subsidiary).
- **Fluid Full Canvas:** Dashboard views must expand to `w-full max-w-none` (no restrictive `max-w-5xl` or `container mx-auto` constraints). Touch targets must maintain a minimum of 44px x 44px. CSS logical properties (`margin-inline`, `padding-inline`) must be used for bi-directional layout stability.

### 3.6 Expiration Priority Engine
- Track official documents (Commercial Registries, Tax Cards, Powers of Attorney, Contractor Licenses) via $\Delta t = \text{Date}_{\text{expiry}} - \text{Date}_{\text{current}}$.
- Render records in 3 sorted visual tiers:
  * **Tier 1 (Expired $\Delta t \le 0$):** Dark Red (`text-red-500 bg-red-950/20 border-red-900/50`).
  * **Tier 2 (Urgent Renewal $1 \le \Delta t \le 45$ days):** Radiant Amber (`text-amber-400 bg-amber-950/20 border-amber-900/50`).
  * **Tier 3 (Active $\Delta t > 45$ days):** Balanced Olive/Emerald (`text-emerald-400 bg-emerald-950/20`).

---

## 4. Tarabot Accounting & FIDIC Domain Rules

### 4.1 Zero-Tolerance Double-Entry Balancing
- For all journal vouchers and GL entries:
  $$\sum \text{Debit} - \sum \text{Credit} = 0.00$$
- Save/post actions must be programmatically disabled if the balance delta is non-zero.
- Sub-ledger postings (Sales, Purchases, Cheque settlements, Extracts) must generate balanced double-entry vouchers atomically.

### 4.2 Treasury Overdraft Prevention
- Real-time balance verification is mandatory before committing any cash disbursement or payment voucher (`VoucherPayload`).
- Negative treasury balances and unauthorized cash overdrafts are strictly rejected.

### 4.3 5-Level Chart of Accounts (COA) Hierarchy
- **Levels 1 to 4:** Structural classification groups (Assets, Liabilities, Equity, Revenue, Expenses, etc.). Direct posting to Levels 1–4 is strictly prohibited.
- **Level 5:** Leaf detail accounts (`dbo.Level5`). Posting is permitted **ONLY** to Level 5 accounts.
- **Cost Center 52:** Project cost allocations must bind to Main Cost Center 52 governing active construction projects.

### 4.4 FIDIC Progressive Extract Calculation Workflow
- **Cumulative Quantity:**
  $$\text{Executed}_{\text{total}} = \text{Executed}_{\text{previous}} + \text{Executed}_{\text{current}}$$
- **Progress Percentage:**
  $$\text{Progress \%} = \left(\frac{\text{Executed}_{\text{total}}}{\text{Contract Quantity}}\right) \times 100$$
- **Contractual Deductions:**
  1. Advance Payment Amortization: $10\%$ of current gross value.
  2. Retention Guarantee Withholding: $5\%$ of current gross value.
- **Net Payable:**
  $$\text{Net Payable} = \text{Gross Current} - (\text{Advance Deduction} + \text{Retention Deduction})$$
- Automatically generate multi-line GL vouchers balancing Net Payable, Retention Guarantee, Advance Recovery, and WIP Revenue.

### 4.5 Moving Average Inventory Costing
- Calculate unit costs dynamically upon settlement of purchase invoices:
  $$\text{New Avg Cost} = \frac{(\text{Current Stock} \times \text{Current Avg Cost}) + (\text{Received Qty} \times \text{Purchase Price})}{\text{Current Stock} + \text{Received Qty}}$$
- Commit calculated values directly to `dbo.Items.Average_Cost`.

### 4.6 ZATCA Phase 1 E-Invoicing QR Matrix
- Embed the 5 mandatory Tag-Length-Value (TLV) fields in the QR code:
  1. Seller Name (`شركة ترابط للمقاولات والتجارة`)
  2. VAT Registration Number (Tax ID)
  3. Invoice Timestamp (ISO 8601 UTC)
  4. Invoice Total (with VAT)
  5. VAT Total Amount

### 4.7 Corporate Governance & Legal Delegation Registry
- **Shareholder Equity Calculation:**
  $$\text{Ownership \%} = \left(\frac{\text{Shares}_{\text{individual}}}{\text{Total Shares}}\right) \times 100$$
- **3-Tier Legal Authority Verification:**
  * **Tier 1:** Banking & Treasury operations (mandates explicit Board Power of Attorney with maximum transaction ceiling).
  * **Tier 2:** Procurement & Commercial Contracts (authorizes project agreements within defined budget limits).
  * **Tier 3:** Litigation & Official Representation (confers authority for court hearings and governmental authorities).

### 4.8 Print Engine Conventions (`@media print`)
- **Official Letterhead:** Mandatory corporate header: `"شركة ترابط للمقاولات والتجارة"` with official Tax ID and Commercial Registry.
- **Table Integrity:** Prevent split rows across page breaks via `page-break-inside: avoid` and `break-inside: avoid`.
- **Sign-off Matrices:**
  * *Standard Vouchers:* أمين الصندوق (Cashier) $\rightarrow$ المحاسب (Accountant) $\rightarrow$ المدير المالي (Financial Manager) $\rightarrow$ المستلم (Recipient).
  * *FIDIC Extracts:* مهندس الموقع (Site Eng.) $\rightarrow$ المكتب الفني (Tech Office) $\rightarrow$ مدير المشروع (PM) $\rightarrow$ الإدارة المالية (Finance) $\rightarrow$ استشاري المالك (Consultant).
- **Orientation:** A4 Portrait for tax invoices and vouchers; A4/A3 Landscape for FIDIC quantity sheets.

---

## 5. Design System Tokens: "The Royal Olive & Warm Ivory"

Adhere strictly to the pre-configured design tokens in `src/index.css` and `tailwind.config.js`.

### 5.1 CSS Custom Properties Token Map

```css
/* Light Mode */
--bg-canvas: #FBF9F5;              /* Soft warm ivory / natural paper finish */
--surface-card: #F3EFE6;           /* Rich alabaster cream surface */
--surface-hover: #EAE4D7;          /* Elevated hover cream */
--brand-olive-primary: #1C291E;    /* Deep Royal Olive (Sidebar & Headers) */
--brand-olive-sidebar: #243324;    /* Forest Olive */
--accent-amber: #D99B26;           /* Radiant Amber (CTAs & Key Alerts) */
--accent-amber-hover: #C58F38;     /* Mustard Amber */
--text-primary: #1A241C;           /* Charcoal with olive undertone */
--text-secondary: #5C665E;         /* Slate Olive */
--border-divider: #E0D9CB;         /* Warm beige border */

/* Dark Mode */
--bg-canvas: #0E1610;              /* Nocturnal Olive */
--surface-card: #17231A;           /* Dark Olive Slate */
--surface-hover: #1F2E23;          /* Elevated Olive Slate */
--brand-olive-primary: #F3EFE6;    /* Luminous Warm Ivory */
--brand-olive-sidebar: #131E15;    /* Deep Forest Night */
--accent-amber: #EBB34D;           /* Soft Glowing Amber */
--accent-amber-hover: #F5C76D;     /* Bright Golden Amber */
--text-primary: #F3EFE6;           /* Luminous text */
--text-secondary: #8FA392;         /* Sage Gray */
--border-divider: #243628;         /* Muted dark border */
```

### 5.2 Tailwind Utility Token Aliases
- `bg-olive-canvas`, `bg-olive-card`, `bg-olive-hover`, `bg-olive-sidebar`
- `text-olive-text`, `text-olive-muted`
- `border-olive-border`
- `text-amber-accent`, `bg-amber-accent`, `hover:bg-amber-hover`

### 5.3 Typography & Directionality
- **Absolute Single Font Lockdown:** `fontFamily: ['Cairo', 'sans-serif']` (Weights: Regular 400, Medium 500, SemiBold 600, Bold 700). Mixed font families are prohibited.
- **Western Arabic Numerals:** Rendered in Cairo with tabular lining figures enabled (`tabular-nums lining-nums`, `toWesternDigits()`, `0-9`).
- **Directionality:** Native Right-to-Left (`dir="rtl"`) layout across all app modules. Financial tokens and percentage units are encapsulated in `dir="ltr"` containers with `whitespace-nowrap` to prevent Unicode Bidirectional Algorithm (UBA) inverted layouts.

### 5.4 Motion & Layout Components
- **Micro-interactions:** Framer Motion spring physics (`transition: { type: "spring", stiffness: 300, damping: 30 }`).
- **Sidebar Rail:** Collapsible vertical navigation mounted on the logical start (right in RTL), collapsing into a compact icon-only mini-rail with floating flyouts on hover.

---

## 6. Project Departmental Sequence & Module Topology
The ERP architecture enforces a standardized modular sequence across sidebars, breadcrumbs, and dashboard cards:

```text
src/components/modules/
├── companies/      # الشركات والمؤسسات (Legal entities, shareholders, legal delegation)
├── engineering/    # المكتب الفني (FIDIC contracts, measurement sheets, extracts)
├── finance/        # المالية والمحاسبة (Chart of accounts, vouchers, treasury, cheques)
├── legal/          # الشؤون القانونية (Contracts, litigation, official POAs, expiration)
├── reception/      # الاستقبال وإدارة الزوار (Front desk visitor registry & security)
└── settings/       # الإعدادات والحوكمة (Repository modes, RBAC, theme options)
```

---

## 7. Execution Checklist for Any Code Modification

Before committing or completing any modification:
1. **Target Verification:** Did I touch ONLY the explicitly requested file/module?
2. **Token Compliance:** Did I avoid arbitrary hex codes, ad-hoc colors, and unapproved styles?
3. **Arabic Phrasing:** Is all Arabic UI copy natural, human, professional, and free of robotic literalisms?
4. **Data Invariants:** Are double-entry balances, Level 5 posting rules, and overdraft guards preserved?
5. **No Test Automation:** Did I avoid generating automated browser tests or running headless runners?

---

## 8. Self-Evolution Changelog & Operational Lessons

*This section dynamically records lessons, edge cases, and adjustments learned from user interactions.*

- **2026-09-28 [Bootstrap Initializer]:** Generated consolidated project skill unifying Universal Core Invariants, Tarabot Accounting/FIDIC domain, "The Royal Olive & Warm Ivory" design system, and natural workplace Arabic UX standards.
- **2026-09-28 [Rule 10 - Single Font Lockdown]:** Enforced `'Cairo', sans-serif` globally across all elements, inputs, buttons, tables, and typography tokens. Abolished fragmented font fallbacks.
- **2026-09-28 [Rule 11 - Sticky Navbar Clearance]:** Standardized top clearance padding (`pt-6 sm:pt-8`) on the scrollable main canvas inside `ShellLayout.tsx` to eliminate header overlap with the fixed topbar.
- **2026-09-28 [Rule 12 - RTL Financial & Percentage Formatting]:** Standardized `FinancialToken` for all amounts, currency units (`ج.م`), deductions (`-${amount}`), and percentages (`[Amount] ج.م ([Percentage]%)`) inside `dir="ltr"` and `whitespace-nowrap` to prevent bidirectional wrapping artifacts.
- **2026-09-28 [Rule 13 - Full-Viewport Modal Overlay & Portal Standard]:** All dialogs, drawers, and modal overlays must mount via React Portals directly to `document.body` with `z-[100]`, completely dimming the viewport and sticky navbars without background bleed.
- **2026-09-28 [Rule 14 - Multi-Jurisdiction State Synchronization]:** Switching jurisdiction/country toggles (Egypt ETA vs. KSA ZATCA) must dynamically update the underlying entity data (9-digit ETA Tax ID vs. 15-digit ZATCA VAT ID, address, currency, VAT rate, and QR structure). Form fields and preview templates must never hold mismatched validation data across profiles.
- **2026-09-28 [Rule 15 - Color Palette Lockdown]:** Abolished electric cyan, neon teal, and unapproved saturated tones. Aligned all modal surfaces, action buttons, and compliance badges strictly to "The Royal Olive & Warm Ivory" design tokens (Amber Gold `#D99B26`, Dark Olive Slate `#17231A`, Subdued Emerald `#2A3F30`, Subdued Crimson `#3F2A2A`).
- **2026-09-28 [Rule 16 - Universal Portal-Based Modal Standard]:** Modals, popovers, and lightboxes must NEVER be declared inline within local page layouts. All modals MUST use the centralized `<Modal>` primitive exported from `@erp/ui-system` mounted directly to `document.body` via React Portals with `z-[100]`. The backdrop must completely dim the full viewport, including all fixed headers and sidebars.
- **2026-09-28 [Rule 17 - Strict Elimination of Ad-Hoc Neon Colors]:** Hardcoded `#00e5a3`, `#10b981`, and electric cyans are strictly forbidden on CTA buttons and primary cards. Primary CTA action buttons across all modals and pages must exclusively use Radiant Amber (`#D99B26` / `#EBB34D`) on Dark Olive text (`#0E1610`).
- **2026-10-08 [Rule 39 - Dual-Theme Architecture & Icon-Only Toggle]:** Re-established Dual-Theme system supporting Light Mode (`#FBF9F5` canvas, `#F3EFE6` card, `#1C291E` olive) and Dark Mode (`#0E1610` canvas, `#17231A` card, `#F3EFE6` text). Enforced icon-only toggle button in `Header.tsx` without text labels ("وضع نهاري"/"ليلي"), guaranteed zero leakage into `@media print` engine, and updated design system tokens.



