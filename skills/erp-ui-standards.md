---
name: erp-ui-standards
description: Strict UI/UX Architectural & Design Standards for Enterprise ERP Portal (App Shell Layout, Navigation Rules, Color Palette).
---

# Enterprise ERP UI/UX Design & Architecture Standards

## 1. App Shell Sticky Layout Architecture (Zero Window-Level Scrolling)

### Core Mandate:
The application must strictly behave like a modern native desktop ERP application. Window/document-level scrolling (`window.scrollY`) is **strictly forbidden**. Under no circumstances should the header disappear or the sidebar detach when scrolling content.

### Viewport Layout Geometry:
```
+-------------------------------------------------------------------+
| Top Header Navbar: h-16 w-full flex-shrink-0 z-40 (STRICTLY FIXED)|
+------------------------------------+------------------------------+
| Vertical Sidebar (RTL / LTR):      | Main Content Workspace:      |
| - h-full flex-shrink-0             | - flex-1 h-full              |
| - overflow-y-auto (INDEPENDENT)    | - overflow-y-auto (ONLY ONE) |
| - border-l / border-r border       | - p-4 sm:p-6 lg:p-8          |
| - bg-[#121B14]                     | - w-full max-w-none          |
|                                    | - bg-[#0E1610]               |
+------------------------------------+------------------------------+
```

### Required CSS / Tailwind Implementation:
1. **Document Roots (`index.css`):**
   ```css
   html, body, #root {
     height: 100%;
     width: 100%;
     margin: 0;
     padding: 0;
     overflow: hidden;
     position: fixed; /* Prevents mobile rubber-banding and scroll leaking */
   }
   ```
2. **Root Viewport Wrapper (`ShellLayout.tsx`):**
   - Must be `h-screen w-screen overflow-hidden flex flex-col`.
3. **Fixed Top Navbar (`Header.tsx`):**
   - Must be `h-16 flex-shrink-0 z-40 w-full border-b border-[#243628] bg-[#0E1610]`.
   - Never use relative positioning that pushes it out of the viewport.
4. **Body Flex Container:**
   - Must be `flex flex-1 overflow-hidden w-full relative min-h-0`.
5. **Independent Vertical Sidebar (`Sidebar.tsx`):**
   - Must be `h-full flex-shrink-0 overflow-hidden border-inline-end border-[#243628] bg-[#121B14]`.
   - The inner navigation list must use `flex-1 min-h-0 overflow-y-auto` with styled scrollbars.
   - Scrolling main page content will NEVER move or displace the sidebar.
6. **Isolated Main Content Workspace:**
   - The central `<main>` canvas must be the **ONLY** element with vertical scrolling:
     `flex-1 h-full overflow-y-auto w-full p-4 sm:p-6 lg:p-8 bg-[#0E1610] max-w-none pb-safe`.

---

## 2. Navigation Architecture: Single Source of Truth

### The Anti-Pattern Rule:
> **STRICT BAN:** Never duplicate vertical sidebar navigation items as stacked horizontal pill bars or tab strips above the main view content.

### Navigation Guidelines:
1. **Primary Route Dispatcher:**
   - The right vertical accordion sidebar (`Sidebar.tsx`) is the single authoritative source of routing and view selection.
2. **Page Sub-Header / Breadcrumb Standards:**
   - Replace any duplicate horizontal tab bars with a single, clean breadcrumb bar:
     - Module Name (e.g. `الشؤون المالية`) &rarr; Active Route (e.g. `الأستاذ العام ودليل الحسابات`).
     - Quick Action Triggers (e.g. `+ إضافة حساب جديد`, `تصدير Excel`, Search / Filter Toggle).
3. **In-Page Sub-Views:**
   - If in-page sub-tabs are functionally necessary (e.g. switching between "شجرة الحسابات" and "العمليات المعلقة"), provide ONLY a single, minimalist segmented control. Never replicate sidebar category links.

---

## 3. "The Royal Olive & Warm Ivory" Color Palette

All neon greens (`#059669`, `#34D399`, `#10B981`, `#00FF00`), electric cyans (`#06B6D4`, `#22D3EE`), and harsh pure pitch blacks (`#000000`) are **strictly prohibited** in dark mode.

### Approved Color Token Dictionary:

| Token Name | Hex Code | Usage / Context |
| :--- | :--- | :--- |
| **Canvas / App Background** | `#0E1610` | Root background for header and main content canvas |
| **Sidebar Background** | `#121B14` | Right vertical navigation drawer background |
| **Cards, Panels & Table Containers** | `#17231A` | Surface container for cards, stat boxes, and trees |
| **Hover / Active Item Background** | `#1F2E23` | Interactive node hover, selected row background |
| **Borders & Dividers** | `#243628` | All card borders, tree branch guides, dividing lines |
| **Primary Typography (Luminous Warm Ivory)** | `#F3EFE6` | Main headings, account titles, high-contrast labels |
| **Secondary Typography (Sage Gray)** | `#8FA392` | Subtitles, helper text, inactive badges, tree lines |
| **Primary Accent / Active Badges / CTA** | `#EBB34D` / `#D99B26` | Warm Golden Amber for folder icons, active states, buttons |
| **Tertiary Accent / Level 5 Leaf** | `#8FA392` | Terminal leaf account indicators, metadata icons |
| **Debit Balance Tag (مدين)** | `#2A3F30` (Bg) / `#A3CFAC` (Text) | Subdued olive sage for Debit tags (Nature: Debit) |
| **Credit Balance Tag (دائن)** | `#3F2A2A` (Bg) / `#EFA3A3` (Text) | Subdued rosewood for Credit tags (Nature: Credit) |

### Tree Node Color Rules:
- **Level Badges:**
  - L1 (Main): Background `#1F2E23`, Text `#EBB34D`, Border `#243628`
  - L2: Background `#1F2E23`, Text `#EBB34D`, Border `#243628`
  - L3: Background `#17231A`, Text `#F3EFE6`, Border `#243628`
  - L4: Background `#17231A`, Text `#8FA392`, Border `#243628`
  - L5 (Terminal / Analytic): Background `#121B14`, Text `#8FA392`, Border `#243628`
- **Account Code Pills:**
  - Background `#1F2E23`, Text `#EBB34D`, Border `#243628`.
- **Folder / Node Icons:**
  - Closed Folder: `#EBB34D` (Amber)
  - Open Folder: `#D99B26` (Amber)
  - File / Terminal Node: `#8FA392` (Sage Gray)

---

## 4. Fluid Full-Width Layout Standard

- All ERP tables, account trees, financial statements, and dashboards must take advantage of high-resolution monitors.
- Never constrain main dashboard content to fixed or narrow containers (`max-w-7xl`, `max-w-5xl`, `container mx-auto`).
- Main canvas and table wrappers must always be:
  ```tsx
  w-full max-w-none
  ```
- Enable horizontal overflow scrolling strictly on the innermost table element when columns exceed the viewport, preventing the parent shell from horizontal jumping.

---

## 5. Numeral Standardization, Single Font Pairing & Financial Spacing

### Western Arabic (English) Numerals Mandate:
- All numbers across all tables, badges, cards, metrics, dates, amounts, and IBANs must strictly render as **Western Arabic numerals (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)**.
- Eastern Arabic/Indic numerals (`٠, ١, ٢, ٣, ٤, ٥, ٦, ٧, ٨, ٩`) are **strictly prohibited** in financial metrics, ledgers, and operational dashboards.
- Never pass `'ar-EG'` directly to `.toLocaleString()` or `.toLocaleTimeString()`.
- Use the centralized formatter utility at `src/utils/formatters.ts`:
  ```typescript
  import { formatCurrency, formatNumber, formatIban, formatDate, toWesternDigits } from '@/utils/formatters';
  ```

### Single Font Pairing Standard:
- **Arabic UI / Typography:** Primary font is **Cairo** (`font-cairo`).
- **Numerals, Balances, Codes & IBANs:** Paired strictly with **Inter** (`font-inter tabular-nums`) with lining figures enabled:
  ```css
  font-variant-numeric: tabular-nums lining-nums;
  font-feature-settings: "tnum" 1, "lnum" 1;
  ```
- **Monospace Anti-Pattern:** Never allow unstyled fallback `font-mono` to trigger dated system fonts (like Courier/Consolas). Always use `font-inter tabular-nums` or configured modern fonts.

### Financial Card Spacing & Polish:
- **Balance Layout:** Always display balance figures with a dedicated, decoupled currency badge (`ج.م`) using flexbox `items-baseline justify-between gap-3`. This prevents awkward wrapping where currency tags wrap beneath numbers.
- **Card Padding:** Use generous padding (`p-4 sm:p-5`) and responsive grid columns (`grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4`) to give accounts and IBANs ample breathing room.

---

### Rule 9: Universal Propagation & Zero-Silo Protocol
Whenever a global directive or styling standard is issued (including typography, numeral systems, color palettes, spacing tokens, or currency formats):
1. **No Localized Hotfixes:** The implementation must never be confined solely to the active screen or sample component.
2. **Centralized Utility First:** Implement or update the utility function in `@erp/ui-system` or `src/utils/`.
3. **Comprehensive Codebase Sweep:** The engineer must immediately audit and update all existing components, sibling routes, and mock datasets across ALL modules to match the new standard before considering the task complete.
4. **Zero Regression Verification:** Verify that adjacent tabs and historical modules remain visually and structurally synchronized.

---

### Rule 10: Absolute Single Font Lockdown
- Under no circumstances should multiple font families coexist in the interface.
- Every element, heading, button, form control, and data table must strictly use `'Cairo', sans-serif`.
- Verify that font declarations in Tailwind or CSS cannot be overridden by browser user-agent stylesheets. All typography aliases (`font-sans`, `font-inter`, `font-cairo`, `font-mono`) must map to Cairo.

### Rule 11: Sticky Navbar Clearance Standard
- Fixed headers and navigation bars must never clip or overlap canvas content.
- The scrollable main workspace must always feature dedicated top clearance padding (`pt-6` or `pt-8` minimum) ensuring full visibility of breadcrumbs and page headers across all viewports.

### Rule 12: RTL Financial & Percentage Formatting Policy
- All financial balances, currency labels (`ج.م`), percentages (`%`), and negative signs (`-`) must be wrapped in `whitespace-nowrap`.
- Currency tags must never wrap onto a separate line beneath the numeric value.
- Percentages must be rendered in clean parentheses following the amount: `[Amount] ج.م ([Percentage]%)` inside a `dir="ltr"` container (`FinancialToken`) to prevent Unicode Bidirectional Algorithm (UBA) symbol flipping in RTL layouts.
- Negative amounts and deductions must have their negative sign tightly bound to the digits (`-120,000 ج.م`), never separated by whitespace.

---

### Rule 13: Full-Viewport Modal Overlay & Portal Standard
- All dialogs, drawers, and modal backdrops must mount via React Portals directly to `document.body` with `z-[100]`.
- Modals must fully dim the entire viewport, including the sticky top navigation and sidebars.

### Rule 14: Multi-Jurisdiction State Synchronization
- Switching jurisdiction/country toggles (e.g., Egypt ETA vs. KSA ZATCA) must dynamically update the underlying entity data (Tax ID format, address, currency, VAT rate, and QR structure).
- Form fields must never hold mismatched validation data across jurisdiction profiles.

### Rule 15: Color Palette Lockdown (Zero Neon Accents)
- Do not introduce electric cyan, neon teal, or unapproved saturated tones.
- All actions and badges must strictly adhere to "The Royal Olive & Warm Ivory" design tokens.

---

### Rule 16: Universal Portal-Based Modal Standard
- Modals, popovers, and lightboxes must NEVER be declared inline within local page layouts.
- All modals MUST use the centralized `<Modal>` primitive exported from `@erp/ui-system` mounted directly to `document.body` via React Portals with `z-[100]`.
- The backdrop must completely dim the full viewport, including all fixed headers and sidebars.

### Rule 17: Strict Elimination of Ad-Hoc Neon Colors
- Hardcoded `#00e5a3`, `#10b981`, and electric cyans are strictly forbidden on CTA buttons and primary cards.
- Primary CTA action buttons across all modals and pages must exclusively use Radiant Amber (`#D99B26` / `#EBB34D`) on Dark Olive text (`#0E1610`).

---

### Rule 18: Reactive Multi-Database Context Propagation
- Any selection made in `DatabaseSwitcher` must propagate globally via React Context, inject `X-Database-Context` into all outbound API headers, and serve as a reactive dependency in React Query keys (`['query-name', activeDatabase]`).
- Financial reports, account trees, and balances must never remain static or hardcoded to legacy databases when a different database context is active.

### Rule 19: Full-Shell Theme Synchronization
- The navigation sidebar, header navbar, modal dialogs, and workspace canvas must maintain synchronized theme states.
- The sidebar must never display a light background while the canvas is in dark mode, or vice versa.

---

### Rule 20: Absolute Prohibition of Hardcoded Database References
- Hardcoding static database names (e.g., 'Tarabot_Data_2023') in frontend components, badges, or backend SQL query strings is strictly prohibited.
- All database operations must derive their context dynamically from the `X-Database-Context` header.
- Date filters and statement headers must automatically align with the fiscal year parsed from the active database name.

---

### Rule 21: Financial Report Active Account Defaulting & SQL Error Transparency
- Financial statement and report screens must default to liquid cash/bank accounts (e.g., Cash Register 1201001) rather than dormant fixed assets, ensuring immediate demonstration of active data.
- Backend SQL endpoints must never silently swallow SQL Server errors or mask table/column mismatches as empty datasets (`[]`). Any syntax or column mapping error must be visibly surfaced in development logs.
- All report tab headers and print buttons must strictly adhere to the Amber/Olive palette and never revert to electric cyan or neon green.

---

### Rule 22: Strict Prohibition of Native Browser Dialogs
- `window.alert()`, `window.confirm()`, and `window.prompt()` are strictly forbidden across the entire codebase.
- All informational alerts, validations, and async status notices must use the unified animated Toast notification system styled in Royal Olive & Warm Ivory tokens.
- Actionable confirmations must use the centralized `<Modal>` primitive.

### Rule 23: Seamless Cross-Module Deep Linking
- Action triggers on summary cards (such as "كشف حساب تفصيلي" on an account card) must seamlessly navigate directly to the destination reporting view with pre-populated query parameters (`accountId`), rather than displaying placeholder messages.

---

### Rule 25: Dynamic Multi-Tenant Database Connection Pooling & Context Propagation
- All SQL Server backend queries must resolve through `getDatabasePool(req.targetDb)`. Static database bindings are strictly forbidden.
- The frontend client interceptor must inject `X-Database-Context` into every request based on the user's active database selection in `localStorage`.
- The database switcher must populate dynamically via `GET /api/system/databases` from `sys.databases`.
- Switching contexts must trigger reactive cache invalidation across all financial and analytical queries.

---

### Rule 26: Resilient Database Failover & Circuit Breaker Standard
- Never allow unmonitored TCP socket timeouts to freeze HTTP requests when remote hosts go offline.
- Implement socket probing with max 1500ms timeout coupled with a 30-60 second Circuit Breaker latch.
- Maintain dual-keyed connection pools (`${mode}:${dbName}`) to achieve instant sub-second database switching in both online and offline fallback modes.

---

### Rule 27: Immutable Corporate Brand Identity Standard (The Royal Olive & Warm Ivory)
- The platform is strictly locked to a single, authoritative theme: "The Royal Olive & Warm Ivory".
- Multi-theme preset pickers, binary dark/light switches, and dynamic luminescence sliders are strictly prohibited.
- The interface is exclusively Arabic (Cairo font, RTL layout, Western Arabic 0-9 digits) with zero language switcher buttons in the primary chrome.
- The top header must remain minimal, uncluttered, and reserved strictly for system identification, active company/database context, notifications, and user authentication.

---

### Rule 28: Enterprise HRMS Architecture Standard
- **Zero External SQL Database Dependencies:** 
  The HRMS module must operate as a fully self-contained client-side reactive state engine (`HRContext.tsx`). It must not block on or mandate external backend databases to deliver rich, real-time interactivity.
- **Deep Cross-Module Interconnectivity (الترابط التام بين موديولات النظام):**
  - **Company Registry (إدارة الشركات والفروع):** Employees and management personnel must be dynamically linked to registered parent companies, subsidiaries, and physical branch entities (`TenantContext`).
  - **Financials (الشؤون المالية والسيولة):** Advances (السلف) and monthly payroll registers must reflect dynamically as accounting liquidity commitments, impacting General Ledger account `230101` and debt recovery schedules.
  - **Technical Office & Projects (المكتب الفني والمشاريع):** Site engineers, surveyors, and field supervisors must be bound directly to active project cost centers (`PRJ-*`).
  - **Front Desk & Reception (الاستقبال والزوار):** Guest arrivals, meeting room bookings, and visitor notifications must link directly to the employee's internal dossier.
  - **Administrative Correspondence (الصادر والوارد CTS):** Employment contracts, administrative warnings, and official circulars must link to official CTS document references.
- **Direct, Practical Arabic UI Terminology (خير الكلام ما قل ودل):**
  Avoid bureaucratic and ambiguous jargon. Strictly use clear, human-friendly labels: "ملفات الموظفين", "الحضور والانصراف", "سجل الإجازات والأرصدة", "مسير الرواتب", "السلف والقروض", "العهد العينية", "العقود والوثائق".
- **Visual Design & Atmosphere Compliance:**
  - Adhere strictly to "The Royal Olive & Warm Ivory" design token dictionary (`#0E1610` canvas, `#17231A` card surfaces, `#EBB34D` golden amber accents, `#F3EFE6` text). Zero neon green or electric cyan.
  - Maintain a clean, dignified corporate aesthetic adhering faithfully to the single brand identity.
  - Western Arabic numbers (`0-9`) with Egyptian Pound currency formatting (`ج.م`).
- **Modal and Dialog Protocol:**
  - All creation workflows (New Employee, Leave Request, Advance Loan, Bank Export, Contract Renewal) must strictly use the centralized React Portal `<Modal>` primitive mounted to `document.body` with `z-[100]`.
- **8-Sub-Route Modular Architecture:**
  The navigation hierarchy must be organized into 8 distinct operational sub-routes:
  1. `hr_directory` (ملفات الموظفين - Personnel Files & Interactive Directory)
  2. `hr_attendance` (الحضور والانصراف - Daily Attendance & Biometric Punches)
  3. `hr_leaves` (سجل الإجازات والأرصدة - Leave Entitlements & 1-Click Approvals)
  4. `hr_payroll` (مسير الرواتب والأجور - Standard Monthly Payroll Ledger)
  5. `hr_payroll_ex` (منصة Payroll - Ex - Specialized Dynamic Payroll Engine)
  6. `hr_advances` (السلف والقروض - Active Loans & Monthly Recovery Schedule)
  7. `hr_custody` (العهد العينية والأصول - Asset Ledger & Instant Clearance Toggles)
  8. `hr_contracts` (العقود والوثائق الرسمية - Expiry Tracking & Compliance Pills)

---

### Rule 28: Smart Tree Flattening for Redundant Hierarchy Nodes
- Tree components must automatically detect and flatten redundant intermediate nodes where a parent and its sole child share identical names and identifiers (e.g., L1 and L2 both named 'الأصول').
- Expanding the root category must immediately reveal the actual functional branches (L3) without forcing repetitive redundant clicks.

### Rule 29: Dynamic Legacy SQL Schema Auto-Aliasing & Error Transparency
- Backend federation bridges connecting to legacy databases must dynamically inspect table schemas or alias columns to bridge differences in naming (e.g., Madeen/Debit, Daeen/Credit, Acc_ID/Account_Number).
- SQL execution failures must never be masked as empty datasets. Syntax or column mismatch errors must be transparently surfaced in server logs to ensure immediate visibility.

### Rule 30: Unified Journal-to-Ledger Posting & Account Inspection Standard
- All financial statement, ledger, and balance queries must resolve through a unified pipeline that merges posted General Journal entries, Cash/Bank Vouchers, and Opening Balances.
- Account comparisons must sanitize legacy database column types using `RTRIM(LTRIM(CAST(AccountID AS VARCHAR)))` to eliminate whitespace and type mismatch discrepancies.
- Account inspection triggers (the eye icon 👁️) must display real-time live balances and a recent transaction feed rather than static empty metadata.
- Deep-linking from an account card must automatically pre-populate the destination report filters with the targeted account identifier.

### Rule 31: Absolute Prohibition of Synthetic Duplicate Voucher IDs
- Synthetic seeders or mock injectors must never fabricate duplicate voucher/journal entry IDs with identical amounts or conflicting dates.
- All ledger and journal feeds must mirror authentic database primary keys.

### Rule 32: Lossless Account Identifier Propagation & Uncapped Inspection
- Deep-linking routes and query parameters must preserve raw account identifiers verbatim without prepending organizational level indices (e.g., Level 5 prefixing must never mutate '4101001' into '54101001').
- Account inspection drawers must display the comprehensive transaction history rather than artificial 5-item truncated slices.

---

### Rule 33: Truthful Financial Statements & Prohibition of Synthetic Figures (مبدأ الشفافية المالية والبيانات الحقيقية 100%)
- **Absolute Real Data Commitment (منع الأرقام الوهمية منعاً باتاً):**
  - All figures rendered across the Balance Sheet (الميزانية العمومية والمركز المالي), Income Statement (قائمة الدخل والأرباح والخسائر), Trial Balance (ميزان المراجعة), and Executive CFO Analytics (لوحة الذكاء المالي) must originate 100% from authentic ledger records (`dbo.GeneralLedger_Details_View` joined with `dbo.Level5_View`) in the active database.
  - No synthetic fillers, pseudo-random generators, or hardcoded dummy millions (e.g., 56M assets or 44M revenues).
  - If a particular account, revenue line, or expense category has no posted transactions in the active database, it must remain empty (`[]`) or render as `0.00 ج.م`.
- **Honest Equilibrium Transparency (صدق معادلة المركز المالي):**
  - If the fundamental accounting equation ($\text{Assets} = \text{Liabilities} + \text{Equity}$) is unbalanced in the live database records (such as prior to posting year-end P&L closing entries to equity), the system must honestly and transparently display that it is **unbalanced (`غير متزنة`)** along with the exact difference in EGP.
  - It is strictly prohibited to fabricate artificial balancing lines to force an equilibrium state (`فرق = 0.00`) when the underlying ledger itself has an unclosed difference. When balanced, show `متزنة بنجاح`; when unbalanced, show `غير متزنة (فرق: X ج.م)` with appropriate alert styling.

---

### Rule 34: ECO Unified Brand Identity & Security Hygiene Standard (هوية ECO الموحدة وتأمين النشر على GitHub)
- **Unified Brand Consistency (هوية ECO):**
  - The application is formally branded as **ECO** across the platform: browser tab `<title>`, Web App Manifest (`manifest.json`), navigation header brand lockup (`ECO ERP`), and system documentation.
- **Strict Repository Security Hygiene (تأمين البيانات والحسابات):**
  - Never commit raw database passwords, production server IP addresses, or secret keys to source repositories.
  - Database connection configurations must support environment variable overrides (`DB_SERVER`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`).
  - Provide a sanitized `.env.example` template for development setup.
  - The project root must maintain an authoritative `.gitignore` that permanently excludes `.env`, `node_modules/`, `dist/`, `*.log`, and temporary scratch or diagnostic scripts.

---

### Rule 35: Distinction Between Authentic Database Records and Experimental Sandbox Features (التمييز الصارم بين البيانات الحقيقية والمحاكاة التجريبية)
- **Authentic Database Binding (ربط البيانات الحقيقية المعتمدة):**
  - Any module with active operational tables in SQL Server (such as Chart of Accounts `dbo.Level5_View`, Ledger Postings `dbo.GeneralLedger_Details`, Approved Suppliers `dbo.Suppliers`, and Treasury Accounts `1201001-1202004`) must render 100% genuine database values without synthetic padding or artificial inflation.
- **Prominent Experimental Badging (وسم الخصائص التجريبية بوضوح):**
  - When engineering advanced upcoming modules whose database tables are provisioned in schema but currently contain zero production records (e.g., Phase 4 Engineering Contracts `CTR-*`, Progressive Extracts `EXT-*`, Billing Sandbox, Cheques Portfolio, or Analytical Cost-Center breakdowns):
    1. Full interactive UI workflows and financial tokens must remain active and functional.
    2. Header banners must prominently display amber preview badges: `تجريبي (بيئة محاكاة)`.
    3. KPI stat cards, metric summaries, and tab selectors must be explicitly tagged with `(تجريبي) / (Preview)`.
    4. Users must never be left in ambiguity regarding whether data originates from live ledger postings or an interactive preview sandbox.

---

### Rule 36: Dynamic Database Discovery & Cloudflare-to-Tailscale Bridge Architecture (المزامنة الحية لقواعد البيانات وبوابة ربط Cloudflare مع Tailscale)
- **Dynamic Card Discovery (توليد الكروت ديناميكياً فقط للقواعد المكتشفة فعلياً):**
  - Database cards in the Federation Hub and Switcher must never be static or hardcoded.
  - When querying the server (`sys.databases` via SQL Bridge), cards are created exclusively for databases that are physically present and verified online.
  - If a database is not found or connection is not established, no dummy card may be rendered ("الكارت ميبقاش موجود على الفاضي").
- **Prohibition of "Fleet / أسطول" Terminology:**
  - Database hubs must use accurate, standard enterprise terminology: `قواعد البيانات المتصلة (Connected Databases)` rather than military/maritime terms like "أسطول".
- **Cloudflare Edge + Tailscale Bridge Standard:**
  - Modern web applications hosted on Cloudflare edge CDNs (such as `eco.hrsup.com`) run client-side JavaScript in user browsers that cannot establish direct TCP sockets to SQL Server Port 1433.
  - A secure API Bridge Gateway (running `sqlBridge.cjs` on port 5000) exposed via Cloudflare Tunnel (`cloudflared`) or Tailscale Funnel provides the secure HTTPS bridge.
  - The frontend dynamically routes all `/api/*` traffic to the configured gateway URL (`localStorage.eco_api_base_url`) via a central fetch interceptor.
  - **Permanent Production Gateway Endpoint:**
    - The dedicated production Cloudflare Tunnel `eco-data-bridge` is permanently bound to `https://datatest.hrsup.com` routing to `http://localhost:5000`.
    - `src/services/apiClient.ts` hardcodes `https://datatest.hrsup.com` as the default production fallback so end users on `https://eco.hrsup.com/` never need manual URL configuration.

---

### Rule 37: Executive Financial Statement Print & Curvature Standards (معايير فخامة طباعة كشوف الحسابات والأستاذ العام)
- **High-Contrast White Print Backgrounds (خلفية بيضاء عالية التباين للطباعة):**
  - All print preview modals and `@media print` sheets must render with crisp white backgrounds (`#ffffff`), dark legible typography (`#0f172a`), and high-contrast borders (`#cbd5e1` / `#94a3b8`).
  - Dark mode surfaces, glow effects, and muted low-contrast grays must never leak into printable sheets.
- **Sub-Header 3-Way Alignment (توزيع ترويسة البيانات الثلاثي):**
  - Directly above the summary cards, the metadata bar follows a 3-way distributed alignment:
    - **Right Side (`text-right`):** `حساب الأستاذ العام` (`subtitleAr`).
    - **Center (`text-center`):** `تاريخ الإصدار: YYYY-MM-DD` (`تاريخ الإصدار`).
    - **Far Left (`text-left`):** Current user's formal display name (`userName` e.g., `م. أحمد مصطفى`) — display name only, never the raw email.
  - Implemented using a balanced 3-column grid (`grid grid-cols-3 items-center`) or flex distribution so each element is anchored cleanly to its respective boundary.
- **Ledger Row Hierarchy & Prominent Framing (التسلسل البصري لصفوف الجدول وترويسة وخاتمة py-3):**
  - **Header Row (`<thead>`):** Prominently sized with `py-3 px-3` (`print:py-2.5 print:px-2`), `text-xs md:text-sm font-bold text-slate-900 bg-slate-100`.
  - **Transaction Rows (`<tbody>`):** Efficiently compacted with `py-1 px-2` (`print:py-1 print:px-2`), font size `11px`, and `leading-tight` to preserve vertical print density.
  - **Grand Total Row (`<tfoot>` / Summary Row):** Prominently sized with `py-3 px-3` (`print:py-2.5 print:px-2`), `text-sm md:text-base font-extrabold text-slate-950`.
  - The negative ending balance `(428,000.00)` is styled in high-contrast red (`text-rose-600 text-negative-balance`) with `overflow-visible px-3 print:px-2.5` to ensure comfortable breathing room away from the rounded border line.
- **Curvy Table Invariant & Frame (ثبات الأركان المنحنية وتفادي تصفير الانحناء بـ border-collapse):**
  - Never use `border-collapse: collapse` when rounded table edges are required, as collapsed borders nullify CSS `border-radius`.
  - Always wrap the table in an outer `.ledger-curvy-frame` container and pair with `border-separate border-spacing-0` on the table:
    ```html
    <div class="ledger-curvy-frame rounded-2xl border border-slate-300 overflow-hidden shadow-sm my-3">
      <table class="w-full table-fixed border-separate border-spacing-0 ...">
        ...
      </table>
    </div>
    ```
  - Apply corner radii to the outermost header and footer cells to guarantee seamless curved backgrounds:
    - Top-Right header cell (in RTL): `rounded-tr-xl`
    - Top-Left header cell (in RTL): `rounded-tl-xl`
    - Bottom-Right total cell (in RTL): `rounded-br-xl`
    - Bottom-Left total cell (in RTL): `rounded-bl-xl`
  - In `@media print`, enforce strict curvature preservation:
    ```css
    @media print {
      .ledger-curvy-frame {
        border-radius: 14px !important;
        overflow: hidden !important;
        border: 1.5px solid #cbd5e1 !important;
        box-shadow: none !important;
        margin: 8px 0 !important;
      }
      .ledger-curvy-frame table,
      table.border-separate {
        border-collapse: separate !important;
        border-spacing: 0 !important;
        border: none !important;
      }
      tr {
        page-break-inside: avoid !important;
      }
    }
    ```
- **Strict 100% Width & Document Type Safety Geometry (توزيع نسب الأعمدة وحماية عمود نوع السند 13%):**
  - Financial print tables must strictly occupy `width: 100% !important; max-width: 100% !important;` with `table-layout: fixed !important;`.
  - The `نوع السند` column is strictly allocated **13%** (with `px-1.5 py-2 text-center text-xs whitespace-nowrap overflow-visible`) to accommodate multi-word labels like "رصيد أول المدة" without spilling into neighboring borders.
  - Locked mathematical percentages totaling 100% across all 7 columns:
    1. `التاريخ` (Date): **11%** (compact, nowrap)
    2. `رقم القيد` (Entry #): **7%** (compact, nowrap)
    3. `نوع السند` (Doc Type): **13%** (safely houses "رصيد أول المدة")
    4. `البيان` (Description): **36%** (flexible, `break-words leading-tight`)
    5. `مدين` (Debit): **11%** (compact, nowrap, tabular-nums)
    6. `دائن` (Credit): **11%** (compact, nowrap, tabular-nums)
    7. `الرصيد` (Balance): **11%** (compact, nowrap, tabular-nums, `overflow-visible px-2`)
  - The `الرصيد` column is allocated **11%** with `overflow-visible px-2` to guarantee negative numbers like `(428,000.00)` never collide with the left border.
- **KPI Container Padding & RTL Gutter Safety (حماية هوامش كروت المؤشرات ومنع اقتصاص الإطار الأيمن):**
  - Metric summary card grids must include `px-1 py-1 w-full box-border overflow-visible` gutter margins to prevent outer card border clipping in RTL layouts:
    ```html
    <div class="w-full box-border px-1 py-1 overflow-visible mb-4 print:mb-2">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 print:gap-2 overflow-visible w-full box-border ...">
        ...
      </div>
    </div>
    ```
- **Spacious Signature Box Anatomy & Open Canvas (صناديق الاعتماد الموسعة والمساحة البيضاء المفتوحة للتوقيع):**
  - Official print layouts feature three spacious approval boxes (`المحاسب`, `المراجع`, `يعتمد`) with a prominent height (`min-h-[110px] print:min-h-[105px]`).
  - **No "التوقيع" Dots Line:** Completely remove dotted lines (`التوقيع: .....................`) to keep a clean, generous signing canvas for handwritten signatures and physical stamps.
  - **Box Anatomy (هيكلية الصندوق):**
    - **Top:** Header title in `font-bold text-sm text-slate-900 print:text-black`.
    - **Middle:** Unobstructed white space for physical signing and stamping.
    - **Bottom:** Center-aligned handwritten date slot anchored cleanly with `mt-auto pt-4`:
      ```html
      <div class="mt-auto pt-4 text-center text-xs text-slate-700" dir="rtl">
        التاريخ: &nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; م
      </div>
      ```
- **Dynamic Red Highlighting for Negative Balances (تمييز الأرصدة السالبة باللون الأحمر الصريح):**
  - All cumulative balances in the "الرصيد" column (opening balance, transaction rows, and grand totals) that evaluate to negative (`balance < 0` or rendered with parentheses) must be styled in high-contrast red:
    - Tailwind classes: `text-rose-600 font-semibold text-negative-balance` (Hex `#dc2626` / `#e11d48`).
    - In `@media print`, strict print preservation is enforced via `.text-negative-balance { color: #dc2626 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }`.
    - Positive and zero balance values remain standard high-contrast dark slate (`text-slate-900 font-bold`).
- **Center-Aligned Data Cells (توسيط الأرقام والنصوص في الخلايا):**
  - All financial table cells (dates, entry numbers, transaction types, debits, credits, and balances) must be center-aligned horizontally and vertically (`text-center align-middle`).
- **Physical Printer Margin Clearance & A4 Pagination (رفع ترقيم الصفحات وتفادي هوامش الطابعات الفيزيائية):**
  - Page numbering configured using CSS Paged Media `@bottom-center` with at least `20mm` bottom margin so hardware print margins never cut page counters in half:
    ```css
    @page {
      size: A4 portrait;
      margin-top: 10mm;
      margin-inline: 12mm;
      margin-bottom: 20mm; /* Extra room so footer never clips */
      @bottom-center {
        content: counter(page) " - " counter(pages);
        font-family: inherit;
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
      }
    }
    ```
  - Printable fallback footer raised to `10mm` from the physical sheet edge:
    ```css
    .print-page-number {
      position: fixed;
      bottom: 10mm; /* Lifted up away from hardware cutoff margins */
      left: 0;
      right: 0;
      text-align: center;
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
    }
    ```
- **Zero-Orphan Financial Print Signatures Standard (معيار منع انفصال التوقيعات في صفحة مستقلة):**
  - **Invariant 1 (حظر العزلة):** Signature boxes must NEVER be printed on an isolated blank page without associated transaction data rows.
  - **Invariant 2 (الترابط الإلزامي للصفوف الأخيرة):** The terminal 2 to 3 data rows, grand total row, and approval matrix are bound together using `break-inside: avoid` and `page-break-after: avoid`:
    ```css
    /* Prevent the grand total and signature block from ever decoupling */
    .ledger-final-section,
    .ledger-signatures {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    
    /* Ensure the last 2-3 transaction rows cling to the totals */
    tbody tr:nth-last-child(-n+3),
    tr.ledger-tail-row {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      break-after: avoid !important;
      page-break-after: avoid !important;
    }

    .ledger-curvy-frame {
      break-after: avoid !important;
      page-break-after: avoid !important;
    }
    ```
    If remaining space cannot accommodate both the rows and signatures, the browser automatically pushes the last 2-3 transactions along with the grand total and signatures to the next page, ensuring authentic transaction data always accompanies signatures.
  - **Invariant 3 (الكثافة المرنة واستيعاب التجاوزات الطفيفة):** Elastic density scaling and tight print margins (`print:mt-1.5 print:pt-1`, `print:min-h-[90px]`, `.print-ledger-container { transform: scale(0.97); transform-origin: top center; }`) must prioritize absorbing the approval block into the preceding page before triggering a multi-row page split.

---

## Rule 38: Uncapped Journal Dataset Integrity Standard (معيار استيعاب قيود اليومية الكاملة بلا حجب)

- **No Arbitrary SQL Clamps (حظر القيود التعسفية):** Journal and Ledger APIs must never apply hardcoded `TOP 50` or artificial record ceilings. Financial reporting, general journal registers, and ledger statements must ingest and serve the complete dataset of committed, posted vouchers from connected tenant databases (`dbo.GeneralLedger_Head`, `dbo.GeneralLedger_Details`, `Level5_View`, etc.) across all schemas (`MK_Khalil_Db_2026`, `Tarabot_Data_2026`, etc.).
- **Full Spectrum Auditability (إتاحة السجل المالي بالكامل):** All journal entries recorded in the SQL Server instance (e.g. sequence from Entry #61 up to Entry #285+) must be accessible via fluid frontend pagination ([25], [50], [100], [250], [عرض الكل (Show All)]) and global search. Searching for any voucher number (e.g., `211` or `٢١١`) must locate and display it immediately.
- **Accurate Ledger Totals (حساب المؤشرات التراكمية على كامل البيانات):** Financial aggregates and KPIs—including Total Posted Vouchers (`إجمالي القيود المرحلة`), Total Debit Turnovers (`إجمالي الحركات المدينة`), Total Credit Turnovers (`إجمالي الحركات الدائنة`), and Double-Entry Balance Integrity (`اتزان الأستاذ العام = 0.00 ج.م`)—must always compute dynamically against the 100% complete dataset (`COUNT(*)`, `SUM(Debit)`, `SUM(Credit)`), never against an artificially sliced array.
- **High-Volume Client-Side Scalability (استجابة فائقة السرعة 60 FPS):** Large transaction views (300+ to 1,000+ entries) must employ client-side windowing and fluid pagination with an option for "عرض الكل" (Show All), ensuring zero UI lag or DOM memory bloat. Sub-line breakdowns must load in batches or on-demand without exceeding SQL Server parameter limits.

---

---

## Rule 39: Enterprise RBAC, Session Persistence & Cinematic Gateway Standards (معيار إدارة الصلاحيات المؤسسية وبوابة الدخول السينمائية)

- **Absolute Financial Bridge Decoupling Invariant (حظر المساس بالربط المالي المحلي):**
  - The local SQL Server financial bridge (`server/sqlBridge.cjs`), database catalogs (`MK_Khalil_Db_2026`, `Tarabot_Data_2026`), general ledger vouchers, journals, and chart of accounts must remain strictly decoupled, isolated, and untouched by user authentication layers.
  - The authentication, session persistence, and RBAC matrix operate in a dedicated, decoupled auth domain (`src/context/AuthContext.tsx`, `src/types/auth.ts`). Edge or cloud user identity stores must never alter the local SQL connection strings, circuit breaker states, or financial ledger procedures.

- **Role-Based Access Control (RBAC) Hierarchy & Domain Matrix:**
  The platform strictly enforces role-based clearance levels:
  1. **`SUPER_ADMIN` (C-Suite / الإدارة العليا - Level 4):**
     - Full platform governance across all 12 modules (`executive`, `companies`, `finance`, `hr`, `engineering`, `cts`, `legal`, `insurance`, `ats`, `decrees`, `reception`, `settings`).
  2. **`FINANCE_OFFICER` (الشؤون المالية - Level 3):**
     - Dedicated access to General Ledger, Treasury, Vouchers, Cheques, E-Invoicing (ZATCA), Cost Centers, and Financial Reports piped through the local SQL bridge (`finance`, `companies`, `decrees`). Restricted from HRMS, Reception, Legal, and System settings.
  3. **`HR_MANAGER` / `HR_SPECIALIST` (الموارد البشرية - Level 3/2):**
     - Dedicated access to Employee Dossiers, Standard Payroll, Attendance, Leaves, Advances, ATS Recruitment, and Social Insurance (`hr`, `ats`, `insurance`, `companies`, `decrees`).
  4. **`PROJECTS_ENGINEER` (المكتب الفني - Level 3):**
     - Access to Engineering Project Registry, Milestones, Payment Certificates (IPC), and Subcontractor Contracts (`engineering`, `companies`, `decrees`).
  5. **`LEGAL_COUNSEL` (الشؤون القانونية - Level 3):**
     - Access to Commercial Contracts Hub, Litigation & Disputes, Powers of Attorney, and Legal Advisory Notes (`legal`, `companies`, `decrees`).
  6. **`RECEPTION_SECURITY` (الاستقبال والزوار - Level 2):**
     - Access to Digital Visitor Check-In, Meeting Room Bookings, Temporary Contractor Passes, and CTS Correspondence (`reception`, `cts`, `decrees`).

- **Dynamic Navigation & Route Guard Standards:**
  - **Sidebar Auto-Filtering:** The vertical accordion navigation (`Sidebar.tsx`) dynamically reflects only the categories authorized for the active user's clearance level. Unauthorized menu items are completely hidden from the DOM.
  - **Executive Launchpad Filtering:** The module card grid in `EmptyCanvas.tsx` displays only authorized operational suites, ensuring a distraction-free operational workspace.
  - **Zero Unauthorized Infiltration (Route Guards):** Any manual URL manipulation or navigation attempt targeting an unauthorized module is intercepted immediately and rendered via the dedicated `<UnauthorizedView />` gateway with clear audit messaging.

- **Luxury Cinematic Authentication Gateway Standards (`/login`):**
  - **Visuals & Ambient Motion:**
    - Dark luxury canvas (`#080E0A`) with animated luminous mesh gradients, radial amber (`#D99B26`) and emerald (`#059669`) glowing orbs.
    - Interactive particle canvas with subtle floating golden stardust and depth blur.
    - Glassmorphic card styling strictly matching `backdrop-blur-2xl bg-slate-900/80 border border-amber-500/20 shadow-2xl rounded-3xl p-8 max-w-md w-full`.
    - High-resolution company insignia for `شركة ترابط للمقاولات والتجارة` & `ECO Enterprise Platform`.
  - **Micro-Interactions & Form Controls:**
    - Floating inputs with amber focus glow and morphing visibility icons.
    - Haptic-style "Remember Me" toggle switch.
    - Golden gradient action button with continuous shimmer effect and real-time biometric radar scanning animation (`Scanning Biometric Token...`).
    - Informative toast error animations with shake physics on invalid credentials.
    - Verified corporate seed switcher for instant executive testing.

---

## Rule 40: Multi-Department RBAC Taxonomy & Executive Authentication Transition Standards (معيار مصفوفة الصلاحيات متعددة الإدارات والتحول التنفيذي لتسجيل الدخول)

- **Comprehensive 9-Department Enterprise RBAC Matrix (مصفوفة الصلاحيات الشاملة لكافة قطاعات المؤسسة):**
  The platform extends beyond Financial Affairs to govern all corporate departments with tabbed/segmented navigation:
  1. **الشؤون المالية (Financial Affairs):** Preserves all 58 granular permissions strictly piped to the local SQL financial bridge (`dbo.GeneralLedger`, `COA`, `Vouchers`, `Cheques`, `E-Invoicing`, `Tax`, `Audit`, `Reporting`).
  2. **الموارد البشرية (HRMS):** ملفات الموظفين، عقود العمل، كشوف المرتبات، مسيرات الأجور، الإجازات، تقييم الأداء، الجزاءات وإنهاء الخدمة.
  3. **المكتب الفني والمشاريع (Technical Office & Projects):** مستخلصات المالك، مستخلصات مقاولي الباطن، كشوف الحصر، أوامر التغيير (VOs)، الجداول الزمنية، تقارير الموقع اليومية.
  4. **الشؤون القانونية (Legal Affairs):** متابعة القضايا، مراجعة العقود وتدقيقها، محاضر إثبات الحالة، الإنذارات والتوكيلات الرسمية.
  5. **الصادر والوارد (Correspondence CTS):** قيد المراسلات الواردة، إصدار الخطابات الصادرة، التوجيه الإداري، الأرشفة الضوئية وسرية المستندات.
  6. **التأمينات الاجتماعية (Social Insurance):** استمارات س1 وس2 وس6، سداد الاشتراكات الشهرية، فتح وإغلاق ملفات المقاولات والعمليات.
  7. **استقطاب الكفاءات (ATS - Recruitment):** نشر الإعلانات الوظيفية، فحص السير الذاتية، جدولة المقابلات، عروض العمل (Job Offers).
  8. **الاستقبال والزوار (Front Desk & Security):** سجل الزيارات، تصاريح الدخول، استلام الطرود والمستندات الورقية.
  9. **الإدارة العليا والاستراتيجية (C-Suite Governance):** مؤشرات الأداء (KPIs)، مصفوفة المخاطر، الاعتمادات الاستراتيجية، إقفال الفترات.

- **Header Profile Popover Geometric Anchoring & Surface Opacity (معيار قائمة الملف الشخصي في الهيدر):**
  - **Left Edge Clamping:** The user profile dropdown in `Header.tsx` must be securely anchored with viewport safety clamps (`left-0 sm:left-4 origin-top-left max-w-[calc(100vw-24px)]`), guaranteeing it never overflows or bleeds outside the left browser window boundary on mobile or desktop viewports.
  - **Eliminating Transparency Leak:** All dropdown surfaces must use solid, opaque executive materials (`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl backdrop-blur-xl`). Background elements (such as page cards or canvas texts) must NEVER bleed through or clash with dropdown menu options.
  - **Refined Role-Switching Grid:** The quick-role switcher must use compact paddings, subtle borders, and harmonious active indicators (`bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold`) for an understated, executive finish.

- **Corporate Enterprise Login Experience & Terminology Standards (`LuxuryLoginPage.tsx`):**
  - **Strict Enterprise Tone:** All sci-fi, gaming, theatrical, or pseudo-cryptographic terminology is strictly purged.
    - Submit CTA button: **`[تسجيل الدخول]`** (replacing `[دخول المنظومة المشفرة]`).
    - Password field: **`كلمة المرور`** (removing `256-bit AES` and `المشفرة`).
    - Username field: **`اسم المستخدم أو البريد الإلكتروني`**.
    - Corporate identity banner: **`شركة ترابط للمقاولات والتجارة`** (Subtitle: `منظومة إدارة الموارد المؤسسية الذكية ECO`).
    - Persistent session toggle: **`تذكرني على هذا الجهاز`** (removing `حماية السجلات النشطة`).
    - Zero bottom clutter: No fake security hashes, faux IP trackers, or synthetic crypto strings.
  - **Non-Destructive Error Handling:**
    - On invalid credentials, prevent full-page reload (`e.preventDefault()`).
    - Trigger a clean CSS shake animation (`animate-shake`) on the card container.
    - Render an unmistakable corporate inline error alert beneath inputs:
      `"بيانات الاعتماد غير صحيحة، يرجى التحقق من اسم المستخدم وكلمة المرور."` (`text-rose-400 bg-rose-950/40 border border-rose-800/60 rounded-xl p-3 text-xs`).
    - Preserve entered username/password values so the user can correct typos without frustrating form resets.

- **Cinematic Welcome Splash Transition (الانتقال التنفيذي الترحيبي بعد تسجيل الدخول):**
  - On valid credential verification, gracefully animate the login card out (`transition-all duration-300 opacity-0 scale-95`).
  - Render an executive, cinematic welcome splash screen over the stardust particle canvas for exactly 1.8 seconds:
    - Glowing emerald/golden circular badge with an animated checkmark icon (`w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-amber-500/20 border border-emerald-500/40 shadow-xl`).
    - High-contrast personalized typography: `مرحباً بك، {user.name}`.
    - Subtitle with subtle loading spinner and pulse: `جاري تهيئة لوحة التحكم وصلاحيات {user.roleTitle}...`.
  - Seamlessly route the user to the operational dashboard (`navigate('/')`) upon timer completion.

- **Clean Production State & Real Audit Logging (نظافة بيئة الإنتاج وسجل العمليات الحقيقي):**
  - **Zero Dummy Clutter:** Strip out random filler records, dummy mock users, and simulated test accounts. The system starts with the genuine root executive administrator:
    `م. أحمد مصطفى` / `admin@hrsup.com` (National ID: `28501010102345`).
  - **Fully Functional User Management Modals:** "إضافة مستخدم جديد" (Add User) and "تعديل الصلاحيات" (Edit User) modals must execute complete validation (Arabic Name, English Name, 10-14 digit National ID, Corporate Email, Username, Department, Role, Clearance Level, Password) with status toggles (`ACTIVE` / `SUSPENDED`). Root administrator account is permanently protected from deletion or suspension.
  - **Dynamic Action-Driven Audit Trail:** Audit logs (`AuditLogsView.tsx`) must track REAL client interactions dynamically (`AUTH: LOGIN_SUCCESS`, `USER_MGMT: CREATE_USER`, `USER_MGMT: UPDATE_USER`, `RBAC: UPDATE_ROLE_PERMISSIONS`) with authentic timestamps, user names, role titles, and network identities instead of hardcoded strings.

## Rule 41: Absolute Prohibition of Melodramatic & Pseudo-Technical Jargon (حظر المصطلحات المسرحية والتقنية الزائفة والالتزام باللغة المؤسسية الصريحة)

- **Strict Policy (سياسة الحظر الصارم للمصطلحات المتكلفة والخيالية):** Under NO circumstances may the system use theatrical, sci-fi, or inflated vocabulary. All UI copy, labels, headers, badges, and log descriptions MUST use plain, natural, and standard Arabic corporate accounting terminology.
- **Permanent Mapping Invariants (Enforce Everywhere عبر كافة الواجهات والحقول والسجلات):**
  - ❌ `سجل العمليات والأمان المؤسسي الحي (Live Audit Trail)` ➡️ ✅ `سجل العمليات`
  - ❌ `توثيق ديناميكي مشفر لكافة عمليات الدخول وتعديل الصلاحيات في الزمن الحقيقي` ➡️ ✅ `سجل متابعة حركات المستخدمين وتسجيل الدخول وتعديل الصلاحيات.`
  - ❌ `حوكمة الصلاحيات` / `بروتوكول حوكمة الصلاحيات` ➡️ ✅ `تعديل الصلاحيات` أو `الصلاحيات`
  - ❌ `الأمان المركزي` / `تهيئة منظومة الأمان المركزي` ➡️ ✅ `إعدادات النظام`
  - ❌ `تأكيد الحساب الإداري الجذري وتفعيل بروتوكول حوكمة الصلاحيات (RBAC)` ➡️ ✅ `إنشاء حساب الإدارة وتفعيل الصلاحيات`
  - ❌ `اسم المستخدم للولوج` ➡️ ✅ `اسم المستخدم`
  - ❌ `إنشاء وتثبيت الحساب` ➡️ ✅ `حفظ المستخدم` أو `إضافة مستخدم`
  - ❌ `دخول المنظومة المشفرة` ➡️ ✅ `تسجيل الدخول`
  - ❌ `حماية السجلات النشطة` / `256-bit AES` ➡️ Delete completely (حذف تام).
  - ❌ `تسجيل الخروج من المنظومة` ➡️ ✅ `تسجيل الخروج`
  - ❌ `الرقم القومي / رقم الهوية الوطنية (10 - 14 رقماً)` ➡️ ✅ `الرقم القومي`

---

## Rule 42: Dual-Theme Architecture & Icon-Only Toggle Standard (معيار الوضع المزدوج النهاري والليلي والأيقونة المجردة)

- **Two Immutable Color Profiles (وضع نهاري وليلي حصراً):** The application strictly supports two harmonious corporate themes defined under "The Royal Olive & Warm Ivory" design system:
  - **Light Mode (الوضع النهاري):**
    - Canvas / Background: `#FBF9F5` (Soft warm ivory / natural paper finish)
    - Surface Card: `#F3EFE6` (Rich alabaster cream surface)
    - Surface Hover: `#EAE4D7` (Elevated hover cream)
    - Primary Text: `#1A241C` (Charcoal with olive undertone)
    - Secondary Text / Muted: `#5C665E` (Slate Olive)
    - Border / Divider: `#E0D9CB` (Warm beige border)
    - Brand Olive Primary: `#1C291E` (Deep Royal Olive)
    - Accent Amber: `#D99B26` (Radiant Amber)
  - **Dark Mode (الوضع الليلي):**
    - Canvas / Background: `#0E1610` (Nocturnal Olive)
    - Surface Card: `#17231A` (Dark Olive Slate)
    - Surface Hover: `#1F2E23` (Elevated Olive Slate)
    - Primary Text: `#F3EFE6` (Luminous text)
    - Secondary Text / Muted: `#8FA392` (Sage Gray)
    - Border / Divider: `#243628` (Muted dark border)
    - Brand Olive Primary: `#F3EFE6` (Luminous Warm Ivory)
    - Accent Amber: `#EBB34D` (Soft Glowing Amber)
- **Icon-Only Header Toggle Mandate (حظر النصوص على زر التبديل والالتزام بالأيقونة المجردة):**
  - The theme switcher mounted in the primary header (`Header.tsx`) must strictly be an icon button (`w-9 h-9 rounded-xl`).
  - **Strict Ban on Text:** Writing literal text labels such as "وضع نهاري" or "وضع ليلي" inside the button is **strictly prohibited**.
  - **Icon State:**
    - In Dark Mode: Renders `<Sun className="w-4 h-4 text-[#EBB34D]" />` with subtle hover rotation.
    - In Light Mode: Renders `<Moon className="w-4 h-4 text-[#1C291E]" />` with subtle hover rotation.
  - **Accessibility:** Accessible `aria-label` and `title` tooltip attributes are preserved for screen readers and tooltips without polluting the visual layout.
- **Strict Print Isolation Guarantee (عزل تام لمنظومة الطباعة @media print):**
  - Toggling between Light and Dark modes must **NEVER** affect print rendering, paper backgrounds, or printable reports.
  - All `@media print` rules enforce independent absolute high-contrast resets (`background: #ffffff !important`, `color: #0f172a !important`, borders `#cbd5e1 !important`) ensuring zero dark-mode leaks or color bleed during hardcopy printing or PDF generation.




