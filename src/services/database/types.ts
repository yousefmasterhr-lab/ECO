export type RepositoryMode = 'LOCAL' | 'CLOUD';

export type AccountNature = 0 | 1; // 0 = Debit (مدين), 1 = Credit (دائن)

export type StatementType = 'BALANCE_SHEET' | 'INCOME_STATEMENT'; // ميزانية عمومية | أرباح وخسائر

export interface RawAccountRecord {
  Level5_ID: string;
  Level5_Name_A: string;
  Level5_Name_E: string;
  Level4_ID: string;
  Level4_Name_A: string;
  Level3_ID: string;
  Level3_Name_A: string;
  Level2_ID: string;
  Level2_Name_A: string;
  Level1_ID: string;
  Level1_Name_A: string;
  Account_Nature: string | number;
  Balance?: number;
  balance?: number;
}

export interface AccountNode {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  level: 1 | 2 | 3 | 4 | 5;
  nature: AccountNature; // 0 = Debit, 1 = Credit
  natureLabelAr: string; // 'مدين' | 'دائن'
  statementType: StatementType; // ميزانية عمومية | قائمة الدخل
  parentId?: string;
  parentNameAr?: string;
  children: AccountNode[];
  leafCount: number; // Count of detail accounts underneath
  balance?: number; // Sample or active journal balance
  currency?: string;
  isActive: boolean;
}

export interface CostCenterItem {
  Costcenter_ID: string;
  Costcenter_Name_A: string;
  Costcenter_Name_E: string;
  id?: string;
  code?: string;
  nameAr?: string;
  nameEn?: string;
}

export interface ConnectionStatusInfo {
  connected: boolean;
  mode: RepositoryMode;
  engine: string;
  serverName: string;
  databaseName: string;
  totalAccounts: number;
  timestamp: string;
  latencyMs: number;
  error?: string;
}

export interface FinancialSummary {
  totalAccounts: number;
  level1Count: number;
  level5Count: number;
  debitCount: number;
  creditCount: number;
  costCentersCount: number;
  balanceSheetAccounts: number;
  incomeStatementAccounts: number;
  syncTimestamp: string;
}

export interface FinancialRBACPermission {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  categoryAr: string;
  categoryEn: string;
  descriptionAr: string;
  defaultRoles: ('cfo' | 'chief_accountant' | 'general_accountant' | 'treasurer' | 'purchaser' | 'auditor')[];
}

// ==========================================
// PHASE 2 EXTENSIONS: Treasury, Vouchers & Cheques
// ==========================================

export interface TreasuryAccountItem {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  type: 'CASH' | 'BANK';
  balance: number;
  totalDebit?: number;
  totalCredit?: number;
  currency: string;
  bankName: string;
  accountNumber: string;
}

export type VoucherType = 'RECEIPT' | 'PAYMENT';

export interface VoucherDetailLine {
  sr: number;
  level5Id: string;
  level5NameAr: string;
  debit: number;
  credit: number;
  costcenterId: string;
  costcenterNameAr: string;
  description: string;
}

export interface VoucherHeaderItem {
  id: string;
  noteNo: number;
  noteDate: string;
  voucherType: VoucherType;
  description: string;
  amount: number;
  netText: string;
  entryName: string;
  treasuryAccountId: string;
  treasuryAccountName: string;
  costcenterName: string;
  lines?: VoucherDetailLine[];
  status: 'DRAFT' | 'APPROVED' | 'POSTED';
  timestamp?: string;
}

export interface VoucherPayload {
  noteNo?: number;
  noteDate: string;
  voucherType: VoucherType;
  description: string;
  amount: number;
  netText: string;
  entryName?: string;
  treasuryAccountId: string;
  treasuryAccountName: string;
  costcenterName?: string;
  lines: VoucherDetailLine[];
}

export type ChequeType = 'RECEIVABLE' | 'PAYABLE';
export type ChequeStatus = 'UNDER_COLLECTION' | 'CLEARED' | 'BOUNCED' | 'CANCELLED';

export interface ChequeItem {
  id: string;
  chequeNo: string;
  type: ChequeType;
  drawerName: string;
  bankName: string;
  targetAccount: string;
  targetAccountName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: ChequeStatus;
  statusDate: string;
  costcenterId?: string;
  costcenterName?: string;
  notes?: string;
  journalNo?: string;
}

export interface ChequePayload {
  chequeNo: string;
  type: ChequeType;
  drawerName: string;
  bankName: string;
  targetAccount: string;
  targetAccountName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status?: ChequeStatus;
  costcenterId?: string;
  costcenterName?: string;
  notes?: string;
}

export interface JournalLineItem {
  sr: number;
  level5Id: string;
  level5NameAr: string;
  debit: number;
  credit: number;
  costcenterId?: string;
  costcenterNameAr?: string;
  description: string;
}

export interface JournalEntryItem {
  id: string;
  noteNo: number;
  noteDate: string;
  description: string;
  debitTotal: number;
  creditTotal: number;
  netText?: string;
  entryName?: string;
  lines?: JournalLineItem[];
  status: 'DRAFT' | 'POSTED';
  timestamp?: string;
}

export interface JournalPayload {
  noteNo?: number;
  noteDate: string;
  description: string;
  debitTotal: number;
  creditTotal: number;
  netText?: string;
  lines: JournalLineItem[];
}

// ==========================================
// PHASE 3: Commercial Sales, Procurement & Inventory
// ==========================================

export interface PackagingUnit {
  unitId: number;
  unitNameAr: string;
  multiplier: number; // Unit_Exchang
}

export interface ItemSKU {
  itemId: number;
  skuCode: string;
  nameAr: string;
  nameEn?: string;
  category?: string;
  vatRate: number; // e.g. 0.15
  averageCost: number;
  retailPrice: number;
  wholesalePrice: number;
  stockBalance: number;
  units: PackagingUnit[];
}

export interface ClientRecord {
  clientId: number;
  nameAr: string;
  nameEn?: string;
  vatNo: string;
  limitAmount: number;
  tel: string;
  address?: string;
  currentBalance?: number;
}

export interface SupplierRecord {
  supplierId: number;
  nameAr: string;
  nameEn?: string;
  vatNo: string;
  limitAmount: number;
  tel: string;
  address?: string;
  currentBalance?: number;
}

export interface SalesInvoiceLine {
  sr: number;
  itemId: number;
  itemNameAr: string;
  unitId: number;
  unitNameAr: string;
  unitExchange: number;
  qty: number;
  price: number;
  total: number;
  discountAmount: number;
  net: number;
  vatRate: number;
  vatAmount: number;
  netWithTax: number;
}

export interface SalesInvoiceHeader {
  id: string;
  noteNo: number;
  noteDate: string;
  noteType: 'CASH' | 'CREDIT';
  clientId: number;
  clientNameAr: string;
  vatNo: string;
  inventoryId: number;
  inventoryNameAr: string;
  salesmanName?: string;
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  vatAmount: number;
  grandTotal: number;
  netText?: string;
  journalNo?: number;
  lines: SalesInvoiceLine[];
  status: 'POSTED' | 'RETURNED';
}

export interface SalesInvoicePayload {
  noteNo?: number;
  noteDate: string;
  noteType: 'CASH' | 'CREDIT';
  clientId: number;
  clientNameAr: string;
  vatNo: string;
  inventoryId: number;
  inventoryNameAr: string;
  salesmanName?: string;
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  vatAmount: number;
  grandTotal: number;
  netText?: string;
  lines: SalesInvoiceLine[];
}

export interface PurchaseBillLine {
  sr: number;
  itemId: number;
  itemNameAr: string;
  unitId: number;
  unitNameAr: string;
  unitExchange: number;
  qty: number;
  price: number;
  total: number;
  vatRate: number;
  vatAmount: number;
  netWithTax: number;
  oldCost?: number;
  newCost?: number;
}

export interface PurchaseBillHeader {
  id: string;
  noteNo: number;
  noteDate: string;
  noteType: 'CASH' | 'CREDIT';
  supplierId: number;
  supplierNameAr: string;
  vatNo: string;
  inventoryId: number;
  inventoryNameAr: string;
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  vatAmount: number;
  grandTotal: number;
  netText?: string;
  journalNo?: number;
  lines: PurchaseBillLine[];
  status: 'POSTED' | 'RETURNED';
}

export interface PurchaseBillPayload {
  noteNo?: number;
  noteDate: string;
  noteType: 'CASH' | 'CREDIT';
  supplierId: number;
  supplierNameAr: string;
  vatNo: string;
  inventoryId: number;
  inventoryNameAr: string;
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  vatAmount: number;
  grandTotal: number;
  netText?: string;
  lines: PurchaseBillLine[];
}

// ==========================================
// PHASE 4: Cost Centers, Contracting & Extracts
// ==========================================

export interface MainCostCenter {
  id: number;
  nameAr: string;
  nameEn?: string;
}

export interface CostCenterNode {
  id: number;
  nameAr: string;
  nameEn?: string;
  mainCenterId: number;
  mainCenterNameAr?: string;
  debit: number;
  credit: number;
  balance?: number;
  directCosts?: number;
  indirectCosts?: number;
  revenue?: number;
  projectMargin?: number;
}

export interface AnalysisDimension {
  id: number;
  nameAr: string;
  level4Id: number;
  notice?: string;
  active: boolean;
  category?: string;
}

export interface ContractRecord {
  id: string;
  contractNo: number;
  contractType: 'CLIENT' | 'SUBCONTRACTOR';
  projectNameAr: string;
  costCenterId: number;
  partyId: number;
  partyNameAr: string;
  consultantNameAr?: string;
  totalValue: number;
  advancePaymentPercent: number;
  retentionPercent: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'SUSPENDED';
  billedToDate: number;
  backlogValue: number;
  notice?: string;
}

export interface ContractPayload {
  contractNo?: number;
  contractType: 'CLIENT' | 'SUBCONTRACTOR';
  projectNameAr: string;
  costCenterId: number;
  partyId: number;
  partyNameAr: string;
  consultantNameAr?: string;
  totalValue: number;
  advancePaymentPercent: number;
  retentionPercent: number;
  startDate: string;
  endDate: string;
  notice?: string;
}

export interface ExtractItemLine {
  sr: number;
  descriptionAr: string;
  unitNameAr: string;
  contractQty: number;
  unitRate: number;
  previousQty: number;
  currentQty: number;
  totalQty: number;
  completionPercent: number;
  currentValue: number;
  cumulativeValue: number;
}

export interface ExtractRecord {
  id: string;
  extractNo: number;
  extractDate: string;
  extractType: 'OWNER' | 'SUBCONTRACTOR';
  contractNo: number;
  projectNameAr: string;
  costCenterId: number;
  partyId: number;
  partyNameAr: string;
  consultantNameAr?: string;
  periodFrom?: string;
  periodTo?: string;
  currentWorkTotal: number;
  advanceDeductionPercent: number;
  advanceDeductionAmount: number;
  retentionDeductionPercent: number;
  retentionDeductionAmount: number;
  otherDeductions: number;
  netPayable: number;
  netPayableText?: string;
  vatRate?: number;
  vatAmount?: number;
  totalWithVat?: number;
  journalNo?: number;
  status: 'APPROVED' | 'DRAFT' | 'PAID';
  lines: ExtractItemLine[];
}

export interface ExtractPayload {
  extractNo?: number;
  extractDate: string;
  extractType: 'OWNER' | 'SUBCONTRACTOR';
  contractNo: number;
  projectNameAr: string;
  costCenterId: number;
  partyId: number;
  partyNameAr: string;
  consultantNameAr?: string;
  periodFrom?: string;
  periodTo?: string;
  currentWorkTotal: number;
  advanceDeductionPercent: number;
  advanceDeductionAmount: number;
  retentionDeductionPercent: number;
  retentionDeductionAmount: number;
  otherDeductions: number;
  netPayable: number;
  netPayableText?: string;
  vatRate?: number;
  vatAmount?: number;
  totalWithVat?: number;
  lines: ExtractItemLine[];
}

export interface ProjectCostingSummary {
  costCenterId: number;
  projectNameAr: string;
  contractValue: number;
  billedRevenue: number;
  directCosts: number;
  indirectCosts: number;
  totalCosts: number;
  wipBalance: number;
  grossMargin: number;
  grossMarginPercent: number;
}

// ==========================================
// PHASE 5: Financial BI, Statements & Reports
// ==========================================

export interface TrialBalanceItem {
  accountCode: string;
  accountNameAr: string;
  accountNameEn?: string;
  level: number;
  parentCode?: string;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  endingDebit: number;
  endingCredit: number;
  isGroup?: boolean;
}

export interface TrialBalanceReportData {
  asOfDate: string;
  startDate: string;
  endDate: string;
  totalOpeningDebit: number;
  totalOpeningCredit: number;
  totalPeriodDebit: number;
  totalPeriodCredit: number;
  totalEndingDebit: number;
  totalEndingCredit: number;
  isBalanced: boolean;
  difference: number;
  items: TrialBalanceItem[];
}

export interface FinancialStatementLine {
  code?: string;
  titleAr: string;
  titleEn?: string;
  amount: number;
  previousAmount?: number;
  percentage?: number;
  isTotal?: boolean;
  isSubtotal?: boolean;
  level?: number;
  indent?: number;
}

export interface IncomeStatementReportData {
  periodName: string;
  startDate: string;
  endDate: string;
  operatingRevenues: FinancialStatementLine[];
  totalOperatingRevenues: number;
  costOfRevenues: FinancialStatementLine[];
  totalCostOfRevenues: number;
  grossProfit: number;
  grossMarginPercent: number;
  operatingExpenses: FinancialStatementLine[];
  totalOperatingExpenses: number;
  operatingProfit: number;
  operatingMarginPercent: number;
  otherIncomesExpenses: FinancialStatementLine[];
  netProfitBeforeTax: number;
  estimatedTax: number;
  netProfitAfterTax: number;
  netMarginPercent: number;
}

export interface BalanceSheetSection {
  titleAr: string;
  lines: FinancialStatementLine[];
  total: number;
}

export interface BalanceSheetReportData {
  asOfDate: string;
  currentAssets: BalanceSheetSection;
  nonCurrentAssets: BalanceSheetSection;
  totalAssets: number;
  currentLiabilities: BalanceSheetSection;
  nonCurrentLiabilities: BalanceSheetSection;
  totalLiabilities: number;
  equity: BalanceSheetSection;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  difference: number;
}

export interface StatementOfAccountLine {
  id: string;
  noteDate: string;
  noteNo: number;
  voucherType: string;
  description: string;
  costCenterNameAr?: string;
  analysisNameAr?: string;
  debit: number;
  credit: number;
  runningBalance: number;
  entryDate?: string;
  DocumentType?: string;
  Note_Date?: string;
  [key: string]: any;
}

export interface StatementOfAccountReportData {
  level5Id: string;
  accountNameAr: string;
  startDate: string;
  endDate: string;
  openingBalance: number;
  totalDebit: number;
  totalCredit: number;
  endingBalance: number;
  transactions: StatementOfAccountLine[];
}

export interface CfoExecutiveMetrics {
  netRevenue: number;
  grossProfit: number;
  grossMarginPercent: number;
  operatingProfit: number;
  operatingMarginPercent: number;
  netProfit: number;
  netMarginPercent: number;
  totalAssets: number;
  workingCapital: number;
  currentRatio: number;
  quickRatio: number;
  totalReceivables: number;
  totalPayables: number;
  monthlyTrends: { monthAr: string; revenue: number; expense: number; margin: number }[];
  projectMargins: { projectNameAr: string; revenue: number; cost: number; margin: number; marginPercent: number }[];
  expenseCategories: { categoryAr: string; amount: number; percentage: number }[];
}


