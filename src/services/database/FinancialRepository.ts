import {
  AccountNode,
  CostCenterItem,
  ConnectionStatusInfo,
  FinancialSummary,
  RepositoryMode,
  TreasuryAccountItem,
  VoucherHeaderItem,
  VoucherPayload,
  ChequeItem,
  ChequePayload,
  JournalEntryItem,
  JournalLineItem,
  JournalPayload,
  ItemSKU,
  ClientRecord,
  SupplierRecord,
  SalesInvoiceHeader,
  SalesInvoicePayload,
  PurchaseBillHeader,
  PurchaseBillPayload,
  CostCenterNode,
  AnalysisDimension,
  ContractRecord,
  ContractPayload,
  ExtractRecord,
  ExtractPayload,
  TrialBalanceReportData,
  IncomeStatementReportData,
  BalanceSheetReportData,
  StatementOfAccountReportData,
  CfoExecutiveMetrics
} from './types';

export interface IFinancialRepository {
  readonly mode: RepositoryMode;
  getConnectionStatus(): Promise<ConnectionStatusInfo>;
  getStatus?(): Promise<ConnectionStatusInfo>;
  getAccounts(forceRefresh?: boolean): Promise<AccountNode[]>;
  getCostCenters(forceRefresh?: boolean): Promise<CostCenterItem[]>;
  getFinancialSummary(): Promise<FinancialSummary>;

  // Phase 2 Extensions
  getTreasuryBalances(): Promise<TreasuryAccountItem[]>;
  getVouchers(type?: 'RECEIPT' | 'PAYMENT' | 'ALL'): Promise<VoucherHeaderItem[]>;
  saveVoucher(data: VoucherPayload): Promise<{ success: boolean; voucher?: VoucherHeaderItem; error?: string }>;
  getCheques(): Promise<ChequeItem[]>;
  updateChequeStatus(id: string, status: string): Promise<{ success: boolean; cheque?: ChequeItem; error?: string }>;
  addCheque(data: ChequePayload): Promise<{ success: boolean; cheque?: ChequeItem; error?: string }>;
  getJournals(): Promise<JournalEntryItem[]>;
  getJournalLines?(noteNo: number): Promise<JournalLineItem[]>;
  saveJournal(data: JournalPayload): Promise<{ success: boolean; journal?: JournalEntryItem; error?: string }>;

  // Phase 3 Extensions
  getItems(): Promise<ItemSKU[]>;
  getClients(): Promise<ClientRecord[]>;
  getSuppliers(): Promise<SupplierRecord[]>;
  getSalesInvoices(): Promise<SalesInvoiceHeader[]>;
  saveSalesInvoice(data: SalesInvoicePayload): Promise<{ success: boolean; invoice?: SalesInvoiceHeader; journalNo?: number; error?: string }>;
  getPurchaseBills(): Promise<PurchaseBillHeader[]>;
  savePurchaseBill(data: PurchaseBillPayload): Promise<{ success: boolean; bill?: PurchaseBillHeader; journalNo?: number; error?: string }>;

  // Phase 4 Extensions
  getCostCentersTree(): Promise<CostCenterNode[]>;
  getAnalysisDimensions(): Promise<AnalysisDimension[]>;
  getContracts(): Promise<ContractRecord[]>;
  saveContract(data: ContractPayload): Promise<{ success: boolean; contract?: ContractRecord; error?: string }>;
  getExtracts(): Promise<ExtractRecord[]>;
  saveExtract(data: ExtractPayload): Promise<{ success: boolean; extract?: ExtractRecord; journalNo?: number; error?: string }>;

  // Phase 5 Extensions: Financial BI & Reports
  getTrialBalance(level?: number, startDate?: string, endDate?: string, costcenterId?: number): Promise<TrialBalanceReportData>;
  getIncomeStatement(startDate?: string, endDate?: string, costcenterId?: number): Promise<IncomeStatementReportData>;
  getBalanceSheet(asOfDate?: string): Promise<BalanceSheetReportData>;
  getStatementOfAccount(level5Id: string, startDate?: string, endDate?: string, costcenterId?: number, analysisId?: number): Promise<StatementOfAccountReportData>;
  getCfoExecutiveMetrics(): Promise<CfoExecutiveMetrics>;
}

