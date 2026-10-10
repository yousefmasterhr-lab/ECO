import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AccountNode,
  CostCenterItem,
  ConnectionStatusInfo,
  FinancialSummary,
  RepositoryMode,
  AccountNature,
  StatementType,
  TreasuryAccountItem,
  VoucherHeaderItem,
  VoucherPayload,
  ChequeItem,
  ChequePayload,
  JournalEntryItem,
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
} from '../services/database/types';
import { FinancialRepositoryFactory } from '../services/database/FinancialRepositoryFactory';
import { useDatabase } from '../services/federation/DatabaseContext';

interface FinancialContextType {
  mode: RepositoryMode;
  toggleMode: () => void;
  connectionStatus: ConnectionStatusInfo | null;
  accounts: AccountNode[];
  costCenters: CostCenterItem[];
  summary: FinancialSummary | null;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  refreshAccounts: (force?: boolean) => Promise<void>;
  selectedAccount: AccountNode | null;
  setSelectedAccount: (acc: AccountNode | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterNature: AccountNature | 'ALL';
  setFilterNature: (val: AccountNature | 'ALL') => void;
  filterStatement: StatementType | 'ALL';
  setFilterStatement: (val: StatementType | 'ALL') => void;
  expandedNodeIds: Set<string>;
  toggleNodeExpand: (nodeId: string) => void;
  expandAllNodes: () => void;
  collapseAllNodes: () => void;

  // Phase 2 State & Methods
  treasuryAccounts: TreasuryAccountItem[];
  vouchers: VoucherHeaderItem[];
  cheques: ChequeItem[];
  journals: JournalEntryItem[];
  refreshPhase2Data: () => Promise<void>;
  saveVoucher: (data: VoucherPayload) => Promise<{ success: boolean; voucher?: VoucherHeaderItem; error?: string }>;
  updateChequeStatus: (id: string, status: string) => Promise<{ success: boolean; cheque?: ChequeItem; error?: string }>;
  addCheque: (data: ChequePayload) => Promise<{ success: boolean; cheque?: ChequeItem; error?: string }>;
  saveJournal: (data: JournalPayload) => Promise<{ success: boolean; journal?: JournalEntryItem; error?: string }>;

  // Phase 3 State & Methods
  items: ItemSKU[];
  clients: ClientRecord[];
  suppliers: SupplierRecord[];
  salesInvoices: SalesInvoiceHeader[];
  purchaseBills: PurchaseBillHeader[];
  refreshPhase3Data: () => Promise<void>;
  saveSalesInvoice: (data: SalesInvoicePayload) => Promise<{ success: boolean; invoice?: SalesInvoiceHeader; journalNo?: number; error?: string }>;
  savePurchaseBill: (data: PurchaseBillPayload) => Promise<{ success: boolean; bill?: PurchaseBillHeader; journalNo?: number; error?: string }>;

  // Phase 4 State & Methods
  costCentersTree: CostCenterNode[];
  dimensions: AnalysisDimension[];
  contracts: ContractRecord[];
  extracts: ExtractRecord[];
  refreshPhase4Data: () => Promise<void>;
  saveContract: (data: ContractPayload) => Promise<{ success: boolean; contract?: ContractRecord; error?: string }>;
  saveExtract: (data: ExtractPayload) => Promise<{ success: boolean; extract?: ExtractRecord; journalNo?: number; error?: string }>;

  // Phase 5 Methods: Financial BI & Reports
  fetchTrialBalance: (level?: number, startDate?: string, endDate?: string, costcenterId?: number) => Promise<TrialBalanceReportData>;
  fetchIncomeStatement: (startDate?: string, endDate?: string, costcenterId?: number) => Promise<IncomeStatementReportData>;
  fetchBalanceSheet: (asOfDate?: string) => Promise<BalanceSheetReportData>;
  fetchStatementOfAccount: (level5Id: string, startDate?: string, endDate?: string, costcenterId?: number, analysisId?: number) => Promise<StatementOfAccountReportData>;
  fetchCfoMetrics: () => Promise<CfoExecutiveMetrics>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeDatabase } = useDatabase();
  const [mode, setMode] = useState<RepositoryMode>(FinancialRepositoryFactory.getMode());
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusInfo | null>(null);
  const [accounts, setAccounts] = useState<AccountNode[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenterItem[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedAccount, setSelectedAccount] = useState<AccountNode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterNature, setFilterNature] = useState<AccountNature | 'ALL'>('ALL');
  const [filterStatement, setFilterStatement] = useState<StatementType | 'ALL'>('ALL');
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set(['L1-1', 'L1-2', 'L1-3']));

  // Phase 2 state
  const [treasuryAccounts, setTreasuryAccounts] = useState<TreasuryAccountItem[]>([]);
  const [vouchers, setVouchers] = useState<VoucherHeaderItem[]>([]);
  const [cheques, setCheques] = useState<ChequeItem[]>([]);
  const [journals, setJournals] = useState<JournalEntryItem[]>([]);

  // Phase 3 state
  const [items, setItems] = useState<ItemSKU[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoiceHeader[]>([]);
  const [purchaseBills, setPurchaseBills] = useState<PurchaseBillHeader[]>([]);

  // Phase 4 state
  const [costCentersTree, setCostCentersTree] = useState<CostCenterNode[]>([]);
  const [dimensions, setDimensions] = useState<AnalysisDimension[]>([]);
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [extracts, setExtracts] = useState<ExtractRecord[]>([]);

  // Listen to Factory mode changes
  useEffect(() => {
    return FinancialRepositoryFactory.subscribe(newMode => {
      setMode(newMode);
    });
  }, []);

  const loadData = useCallback(async (force = false) => {
    // Ensure queries only execute when a user is actively authenticated
    if (typeof window !== 'undefined') {
      const isLogin = window.location.pathname.includes('/login');
      const session = localStorage.getItem('eco_auth_session') || sessionStorage.getItem('eco_auth_session');
      const token = localStorage.getItem('eco_session_token') || sessionStorage.getItem('token');
      if (isLogin || (!session && !token)) {
        setIsLoading(false);
        setIsSyncing(false);
        return;
      }
    }

    try {
      if (force) {
        setIsSyncing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const repo = FinancialRepositoryFactory.getRepository();
      const [
        statusData,
        accountsData,
        costCentersData,
        summaryData,
        treasuryData,
        vouchersData,
        chequesData,
        journalsData,
        itemsData,
        clientsData,
        suppliersData,
        salesData,
        purchasesData,
        costCentersTreeData,
        dimensionsData,
        contractsData,
        extractsData
      ] = await Promise.all([
        repo.getConnectionStatus(),
        repo.getAccounts(force),
        repo.getCostCenters(force),
        repo.getFinancialSummary(),
        repo.getTreasuryBalances(),
        repo.getVouchers('ALL'),
        repo.getCheques(),
        repo.getJournals(),
        repo.getItems(),
        repo.getClients(),
        repo.getSuppliers(),
        repo.getSalesInvoices(),
        repo.getPurchaseBills(),
        repo.getCostCentersTree(),
        repo.getAnalysisDimensions(),
        repo.getContracts(),
        repo.getExtracts(),
      ]);

      setConnectionStatus(statusData);
      setAccounts(accountsData);
      setCostCenters(costCentersData);
      setSummary(summaryData);
      setTreasuryAccounts(treasuryData);
      setVouchers(vouchersData);
      setCheques(chequesData);
      setJournals(journalsData);
      setItems(itemsData);
      setClients(clientsData);
      setSuppliers(suppliersData);
      setSalesInvoices(salesData);
      setPurchaseBills(purchasesData);
      setCostCentersTree(costCentersTreeData);
      setDimensions(dimensionsData);
      setContracts(contractsData);
      setExtracts(extractsData);

      // Default expand root nodes if empty
      if (expandedNodeIds.size === 0 && accountsData.length > 0) {
        setExpandedNodeIds(new Set(accountsData.map(a => a.id)));
      }
    } catch (err: any) {
      console.error('[FinancialProvider] Failed to load financial data:', err);
      setError(err.message || 'حدث خطأ أثناء تحميل بيانات الحسابات والسيولة والتجارة والمشروعات');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [mode, activeDatabase]);

  useEffect(() => {
    // Ensure queries only execute when a user is actively authenticated
    if (typeof window !== 'undefined' && window.location.pathname.includes('/login')) {
      setIsLoading(false);
      return;
    }
    const session = localStorage.getItem('eco_auth_session') || sessionStorage.getItem('eco_auth_session');
    if (!session) {
      setIsLoading(false);
      return;
    }
    loadData(true);
  }, [loadData, activeDatabase]);

  const toggleMode = () => {
    const nextMode = FinancialRepositoryFactory.toggleMode();
    setMode(nextMode);
  };

  const refreshAccounts = async (force = true) => {
    await loadData(force);
  };

  const refreshPhase2Data = async () => {
    const repo = FinancialRepositoryFactory.getRepository();
    const [treasuryData, vouchersData, chequesData, journalsData] = await Promise.all([
      repo.getTreasuryBalances(),
      repo.getVouchers('ALL'),
      repo.getCheques(),
      repo.getJournals(),
    ]);
    setTreasuryAccounts(treasuryData);
    setVouchers(vouchersData);
    setCheques(chequesData);
    setJournals(journalsData);
  };

  const saveVoucher = async (data: VoucherPayload) => {
    const repo = FinancialRepositoryFactory.getRepository();
    const result = await repo.saveVoucher(data);
    if (result.success && result.voucher) {
      setVouchers(prev => [result.voucher!, ...prev]);
      // Update affected treasury account balance
      setTreasuryAccounts(prev => prev.map(acc => {
        if (acc.id === data.treasuryAccountId) {
          const delta = data.voucherType === 'RECEIPT' ? data.amount : -data.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      }));
      // Synchronize Chart of Accounts and Statement queries
      await refreshAccounts(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('erp:cache-invalidate', {
            detail: { queries: ['chart-of-accounts', 'account-statement', 'general-ledger'] }
          })
        );
        const win = window as any;
        if (win.__queryClient?.invalidateQueries) {
          win.__queryClient.invalidateQueries(['chart-of-accounts']);
          win.__queryClient.invalidateQueries(['account-statement']);
        }
      }
    }
    return result;
  };

  const updateChequeStatus = async (id: string, status: string) => {
    const repo = FinancialRepositoryFactory.getRepository();
    const result = await repo.updateChequeStatus(id, status);
    if (result.success && result.cheque) {
      setCheques(prev => prev.map(c => c.id === id ? result.cheque! : c));
    }
    return result;
  };

  const addCheque = async (data: ChequePayload) => {
    const repo = FinancialRepositoryFactory.getRepository();
    const result = await repo.addCheque(data);
    if (result.success && result.cheque) {
      setCheques(prev => [result.cheque!, ...prev]);
    }
    return result;
  };

  const saveJournal = async (data: JournalPayload) => {
    const repo = FinancialRepositoryFactory.getRepository();
    const result = await repo.saveJournal(data);
    if (result.success && result.journal) {
      setJournals(prev => [result.journal!, ...prev]);
      // Synchronize Chart of Accounts and Statement queries
      await refreshAccounts(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('erp:cache-invalidate', {
            detail: { queries: ['chart-of-accounts', 'account-statement', 'general-ledger'] }
          })
        );
        const win = window as any;
        if (win.__queryClient?.invalidateQueries) {
          win.__queryClient.invalidateQueries(['chart-of-accounts']);
          win.__queryClient.invalidateQueries(['account-statement']);
        }
      }
    }
    return result;
  };

  // Phase 3 Actions
  const refreshPhase3Data = async () => {
    try {
      const repo = FinancialRepositoryFactory.getRepository();
      const [itemsData, clientsData, suppliersData, salesData, purchasesData, journalsData] = await Promise.all([
        repo.getItems(),
        repo.getClients(),
        repo.getSuppliers(),
        repo.getSalesInvoices(),
        repo.getPurchaseBills(),
        repo.getJournals(),
      ]);
      setItems(itemsData);
      setClients(clientsData);
      setSuppliers(suppliersData);
      setSalesInvoices(salesData);
      setPurchaseBills(purchasesData);
      setJournals(journalsData);
    } catch (err: any) {
      console.error('[FinancialProvider] Failed to refresh phase 3 data:', err);
    }
  };

  const saveSalesInvoice = async (data: SalesInvoicePayload) => {
    const repo = FinancialRepositoryFactory.getRepository();
    const result = await repo.saveSalesInvoice(data);
    if (result.success && result.invoice) {
      setSalesInvoices(prev => [result.invoice!, ...prev]);
      await refreshPhase3Data();
    }
    return result;
  };

  const savePurchaseBill = async (data: PurchaseBillPayload) => {
    const repo = FinancialRepositoryFactory.getRepository();
    const result = await repo.savePurchaseBill(data);
    if (result.success && result.bill) {
      setPurchaseBills(prev => [result.bill!, ...prev]);
      await refreshPhase3Data();
    }
    return result;
  };

  // Phase 4 Actions
  const refreshPhase4Data = async () => {
    try {
      const repo = FinancialRepositoryFactory.getRepository();
      const [costCentersTreeData, dimensionsData, contractsData, extractsData, journalsData] = await Promise.all([
        repo.getCostCentersTree(),
        repo.getAnalysisDimensions(),
        repo.getContracts(),
        repo.getExtracts(),
        repo.getJournals(),
      ]);
      setCostCentersTree(costCentersTreeData);
      setDimensions(dimensionsData);
      setContracts(contractsData);
      setExtracts(extractsData);
      setJournals(journalsData);
    } catch (err: any) {
      console.error('[FinancialProvider] Failed to refresh phase 4 data:', err);
    }
  };

  const saveContract = async (data: ContractPayload) => {
    const repo = FinancialRepositoryFactory.getRepository();
    const result = await repo.saveContract(data);
    if (result.success && result.contract) {
      setContracts(prev => [result.contract!, ...prev]);
      await refreshPhase4Data();
    }
    return result;
  };

  const saveExtract = async (data: ExtractPayload) => {
    const repo = FinancialRepositoryFactory.getRepository();
    const result = await repo.saveExtract(data);
    if (result.success && result.extract) {
      setExtracts(prev => [result.extract!, ...prev]);
      await refreshPhase4Data();
    }
    return result;
  };

  // Phase 5 Actions
  const fetchTrialBalance = async (level = 4, startDate = '2025-01-01', endDate = '2026-12-31', costcenterId?: number) => {
    const repo = FinancialRepositoryFactory.getRepository();
    return await repo.getTrialBalance(level, startDate, endDate, costcenterId);
  };

  const fetchIncomeStatement = async (startDate = '2026-01-01', endDate = '2026-12-31', costcenterId?: number) => {
    const repo = FinancialRepositoryFactory.getRepository();
    return await repo.getIncomeStatement(startDate, endDate, costcenterId);
  };

  const fetchBalanceSheet = async (asOfDate = '2026-12-31') => {
    const repo = FinancialRepositoryFactory.getRepository();
    return await repo.getBalanceSheet(asOfDate);
  };

  const fetchStatementOfAccount = async (level5Id: string, startDate = '2025-01-01', endDate = '2026-12-31', costcenterId?: number, analysisId?: number) => {
    const repo = FinancialRepositoryFactory.getRepository();
    return await repo.getStatementOfAccount(level5Id, startDate, endDate, costcenterId, analysisId);
  };

  const fetchCfoMetrics = async () => {
    const repo = FinancialRepositoryFactory.getRepository();
    return await repo.getCfoExecutiveMetrics();
  };

  const toggleNodeExpand = (nodeId: string) => {
    setExpandedNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const expandAllNodes = () => {
    const allIds = new Set<string>();
    const collectIds = (nodes: AccountNode[]) => {
      nodes.forEach(n => {
        if (n.level < 5) {
          allIds.add(n.id);
        }
        if (n.children && n.children.length > 0) {
          collectIds(n.children);
        }
      });
    };
    collectIds(accounts);
    setExpandedNodeIds(allIds);
  };

  const collapseAllNodes = () => {
    setExpandedNodeIds(new Set());
  };

  return (
    <FinancialContext.Provider
      value={{
        mode,
        toggleMode,
        connectionStatus,
        accounts,
        costCenters,
        summary,
        isLoading,
        isSyncing,
        error,
        refreshAccounts,
        selectedAccount,
        setSelectedAccount,
        searchQuery,
        setSearchQuery,
        filterNature,
        setFilterNature,
        filterStatement,
        setFilterStatement,
        expandedNodeIds,
        toggleNodeExpand,
        expandAllNodes,
        collapseAllNodes,

        // Phase 2
        treasuryAccounts,
        vouchers,
        cheques,
        journals,
        refreshPhase2Data,
        saveVoucher,
        updateChequeStatus,
        addCheque,
        saveJournal,

        // Phase 3
        items,
        clients,
        suppliers,
        salesInvoices,
        purchaseBills,
        refreshPhase3Data,
        saveSalesInvoice,
        savePurchaseBill,

        // Phase 4
        costCentersTree,
        dimensions,
        contracts,
        extracts,
        refreshPhase4Data,
        saveContract,
        saveExtract,

        // Phase 5
        fetchTrialBalance,
        fetchIncomeStatement,
        fetchBalanceSheet,
        fetchStatementOfAccount,
        fetchCfoMetrics
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = (): FinancialContextType => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
