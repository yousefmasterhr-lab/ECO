import { IFinancialRepository } from './FinancialRepository';
import {
  AccountNode,
  CostCenterItem,
  ConnectionStatusInfo,
  FinancialSummary,
  RepositoryMode,
  RawAccountRecord,
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
} from './types';
import { buildAccountTree } from './treeBuilder';
import cloudAccountsData from '../../data/tarabot_chart_of_accounts.json';
import cloudCostCentersData from '../../data/tarabot_costcenters.json';
import cloudChequesData from '../../data/tarabot_cheques.json';
import cloudReceivablesData from '../../data/tarabot_receivables.json';
import cloudPayablesData from '../../data/tarabot_payables.json';
import cloudJournalsData from '../../data/tarabot_journals.json';
import cloudItemsData from '../../data/tarabot_items.json';
import cloudClientsData from '../../data/tarabot_clients.json';
import cloudSuppliersData from '../../data/tarabot_suppliers.json';
import cloudSalesData from '../../data/tarabot_sales.json';
import cloudPurchasesData from '../../data/tarabot_purchases.json';
import cloudDimensionsData from '../../data/tarabot_dimensions.json';
import cloudContractsData from '../../data/tarabot_contracts.json';
import cloudExtractsData from '../../data/tarabot_extracts.json';

export class CloudAdapter implements IFinancialRepository {
  public readonly mode: RepositoryMode = 'CLOUD';
  private cachedTree: AccountNode[] | null = null;
  private cachedCostCenters: CostCenterItem[] | null = null;

  // In-memory state for Cloud Mode
  private inMemoryVouchers: VoucherHeaderItem[] = [];
  private inMemoryCheques: ChequeItem[] = [...(cloudChequesData as ChequeItem[])];
  private inMemoryJournals: JournalEntryItem[] = [];
  private inMemoryItems: ItemSKU[] = [...(cloudItemsData as unknown as ItemSKU[])];
  private inMemoryClients: ClientRecord[] = [...(cloudClientsData as unknown as ClientRecord[])];
  private inMemorySuppliers: SupplierRecord[] = [...(cloudSuppliersData as unknown as SupplierRecord[])];
  private inMemorySales: SalesInvoiceHeader[] = [...(cloudSalesData as unknown as SalesInvoiceHeader[])];
  private inMemoryPurchases: PurchaseBillHeader[] = [...(cloudPurchasesData as unknown as PurchaseBillHeader[])];
  private inMemoryContracts: ContractRecord[] = [...(cloudContractsData as unknown as ContractRecord[])];
  private inMemoryExtracts: ExtractRecord[] = [...(cloudExtractsData as unknown as ExtractRecord[])];

  constructor() {
    this.hydrateFromSnapshots();
  }

  private hydrateFromSnapshots() {
    // Vouchers
    const recs: VoucherHeaderItem[] = (cloudReceivablesData as any[]).slice(0, 20).map(r => ({
      id: `REC-${r.Note_No}`,
      noteNo: r.Note_No,
      noteDate: r.Note_Date,
      voucherType: 'RECEIPT',
      description: r.Description,
      amount: r.Note_Debit || r.Debit || 500000,
      netText: r.Note_Net_Text || '',
      entryName: r.Entry_Name || 'Cloud Sync',
      treasuryAccountId: String(r.Level5_ID),
      treasuryAccountName: r.Level5_Name_A || 'الخزينة',
      costcenterName: r.Costcenter_Name_A || 'مركز تكلفة عام',
      status: 'APPROVED',
    }));

    const pays: VoucherHeaderItem[] = (cloudPayablesData as any[]).slice(0, 30).map(p => ({
      id: `PAY-${p.Note_No}`,
      noteNo: p.Note_No,
      noteDate: p.Note_Date,
      voucherType: 'PAYMENT',
      description: p.Description,
      amount: p.Note_Debit || p.Debit || 10000,
      netText: p.Note_Net_Text || '',
      entryName: p.Entry_Name || 'Cloud Sync',
      treasuryAccountId: String(p.Level5_ID),
      treasuryAccountName: p.Level5_Name_A || 'الخزينة',
      costcenterName: p.Costcenter_Name_A || 'مركز تكلفة عام',
      status: 'APPROVED',
    }));

    this.inMemoryVouchers = [...recs, ...pays];

    // Journals
    this.inMemoryJournals = (cloudJournalsData as any[]).slice(0, 20).map(j => ({
      id: `JV-${j.Note_No}`,
      noteNo: j.Note_No,
      noteDate: j.Note_Date,
      description: j.Description,
      debitTotal: j.Note_Debit || j.Debit || 0,
      creditTotal: j.Note_Credit || j.Credit || 0,
      netText: j.Note_Net_Text || '',
      entryName: j.Entry_Name || 'Cloud Sync',
      status: 'POSTED',
    }));
  }

  async getConnectionStatus(): Promise<ConnectionStatusInfo> {
    return {
      connected: true,
      mode: 'CLOUD',
      engine: 'Cloud PostgreSQL / Enterprise Managed Warehouse',
      serverName: 'cloud-db.enterprise-erp.internal',
      databaseName: 'Tarabot_Cloud_Replicated_2023',
      totalAccounts: 330,
      timestamp: new Date().toISOString(),
      latencyMs: 38,
    };
  }

  async getAccounts(): Promise<AccountNode[]> {
    if (!this.cachedTree) {
      this.cachedTree = buildAccountTree(cloudAccountsData as unknown as RawAccountRecord[]);
    }
    return this.cachedTree;
  }

  async getCostCenters(): Promise<CostCenterItem[]> {
    if (!this.cachedCostCenters) {
      const list: any[] = Array.isArray(cloudCostCentersData)
        ? cloudCostCentersData
        : (cloudCostCentersData as any).costCenters || [];
      this.cachedCostCenters = list.map((c: any) => ({
        ...c,
        id: c.id || c.Costcenter_ID,
        nameAr: c.nameAr || c.Costcenter_Name_A,
        nameEn: c.nameEn || c.Costcenter_Name_E,
      }));
    }
    return this.cachedCostCenters;
  }

  async getFinancialSummary(): Promise<FinancialSummary> {
    const tree = await this.getAccounts();
    const costCenters = await this.getCostCenters();

    let totalAccounts = 0;
    let debitCount = 0;
    let creditCount = 0;
    let balanceSheetAccounts = 0;
    let incomeStatementAccounts = 0;

    const countLeaves = (nodes: AccountNode[]) => {
      nodes.forEach(n => {
        if (n.level === 5) {
          totalAccounts++;
          if (n.nature === 0) debitCount++;
          else creditCount++;

          if (n.statementType === 'BALANCE_SHEET') balanceSheetAccounts++;
          else incomeStatementAccounts++;
        }
        if (n.children && n.children.length > 0) {
          countLeaves(n.children);
        }
      });
    };

    countLeaves(tree);

    return {
      totalAccounts,
      level1Count: tree.length,
      level5Count: totalAccounts,
      debitCount,
      creditCount,
      costCentersCount: costCenters.length,
      balanceSheetAccounts,
      incomeStatementAccounts,
      syncTimestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  }

  // ==========================================
  // PHASE 2 METHODS
  // ==========================================

  async getTreasuryBalances(): Promise<TreasuryAccountItem[]> {
    return [
      {
        id: '1201001',
        code: '1201001',
        nameAr: 'الخزينة الرئيسية',
        nameEn: 'Main Cash Register',
        type: 'CASH',
        balance: 830864,
        currency: 'EGP',
        bankName: 'صندوق الخزينة الرئيسي',
        accountNumber: 'SAFE-01'
      },
      {
        id: '1202001',
        code: '1202001',
        nameAr: 'حساب المستقبل ايجى بنك 0041605186001',
        nameEn: 'EGY Bank Corporate Account',
        type: 'BANK',
        balance: 1420000,
        currency: 'EGP',
        bankName: 'بنك المستقبل ايجى بنك',
        accountNumber: 'EG1200416051860010000'
      },
      {
        id: '1202002',
        code: '1202002',
        nameAr: 'الاطلنطى جروب بنك مصر 4880199000000476',
        nameEn: 'Banque Misr Operations',
        type: 'BANK',
        balance: 980000,
        currency: 'EGP',
        bankName: 'بنك مصر - فرع طلعت حرب',
        accountNumber: 'EG4880199000000476000'
      },
      {
        id: '1202003',
        code: '1202003',
        nameAr: 'ترابط للمقاولات والتوريدات حساب 2260001000017357',
        nameEn: 'Tarabot Contracting Banque Misr',
        type: 'BANK',
        balance: 994117,
        currency: 'EGP',
        bankName: 'بنك مصر - حساب المشروعات',
        accountNumber: 'EG2260001000017357000'
      },
      {
        id: '1202004',
        code: '1202004',
        nameAr: 'المستقبل البنك الاهلى القطرى QNB رقم 000370000324630200568',
        nameEn: 'QNB Corporate Account',
        type: 'BANK',
        balance: 640000,
        currency: 'EGP',
        bankName: 'بنك QNB الأهلي',
        accountNumber: 'EG0003700003246302005'
      }
    ];
  }

  async getVouchers(type: 'RECEIPT' | 'PAYMENT' | 'ALL' = 'ALL'): Promise<VoucherHeaderItem[]> {
    if (type === 'ALL') return this.inMemoryVouchers;
    return this.inMemoryVouchers.filter(v => v.voucherType === type);
  }

  async saveVoucher(data: VoucherPayload): Promise<{ success: boolean; voucher?: VoucherHeaderItem; error?: string }> {
    const newVoucher: VoucherHeaderItem = {
      id: `${data.voucherType === 'RECEIPT' ? 'REC' : 'PAY'}-${Date.now()}`,
      noteNo: data.noteNo || Math.floor(1000 + Math.random() * 9000),
      noteDate: data.noteDate,
      voucherType: data.voucherType,
      description: data.description,
      amount: data.amount,
      netText: data.netText,
      entryName: data.entryName || 'م. أحمد مصطفى',
      treasuryAccountId: data.treasuryAccountId,
      treasuryAccountName: data.treasuryAccountName,
      costcenterName: data.costcenterName || 'مركز تكلفة عام',
      lines: data.lines,
      status: 'POSTED',
      timestamp: new Date().toISOString()
    };

    this.inMemoryVouchers.unshift(newVoucher);
    return { success: true, voucher: newVoucher };
  }

  async getCheques(): Promise<ChequeItem[]> {
    return this.inMemoryCheques;
  }

  async updateChequeStatus(id: string, status: string): Promise<{ success: boolean; cheque?: ChequeItem; error?: string }> {
    const target = this.inMemoryCheques.find(c => c.id === id);
    if (target) {
      target.status = status as any;
      target.statusDate = new Date().toISOString().split('T')[0];
      return { success: true, cheque: target };
    }
    return { success: false, error: 'Cheque not found' };
  }

  async addCheque(data: ChequePayload): Promise<{ success: boolean; cheque?: ChequeItem; error?: string }> {
    const newCheque: ChequeItem = {
      id: `CHQ-${Date.now()}`,
      ...data,
      status: data.status || 'UNDER_COLLECTION',
      statusDate: new Date().toISOString().split('T')[0]
    };
    this.inMemoryCheques.unshift(newCheque);
    return { success: true, cheque: newCheque };
  }

  async getJournals(): Promise<JournalEntryItem[]> {
    return this.inMemoryJournals;
  }

  async saveJournal(data: JournalPayload): Promise<{ success: boolean; journal?: JournalEntryItem; error?: string }> {
    const debitSum = Number(data.debitTotal) || 0;
    const creditSum = Number(data.creditTotal) || 0;

    if (Math.abs(debitSum - creditSum) > 0.001) {
      return {
        success: false,
        error: `القيد غير متزن محاسبياً! إجمالي المدين (${debitSum}) لا يتطابق مع إجمالي الدائن (${creditSum}).`
      };
    }

    const newJournal: JournalEntryItem = {
      id: `JV-${Date.now()}`,
      noteNo: data.noteNo || Math.floor(5000 + Math.random() * 5000),
      noteDate: data.noteDate,
      description: data.description,
      debitTotal: debitSum,
      creditTotal: creditSum,
      netText: data.netText,
      entryName: 'م. أحمد مصطفى',
      lines: data.lines,
      status: 'POSTED',
      timestamp: new Date().toISOString()
    };

    this.inMemoryJournals.unshift(newJournal);
    return { success: true, journal: newJournal };
  }

  // ==========================================
  // PHASE 3: Commercial Sales, Procurement & Inventory
  // ==========================================

  async getItems(): Promise<ItemSKU[]> {
    return this.inMemoryItems;
  }

  async getClients(): Promise<ClientRecord[]> {
    return this.inMemoryClients;
  }

  async getSuppliers(): Promise<SupplierRecord[]> {
    return this.inMemorySuppliers;
  }

  async getSalesInvoices(): Promise<SalesInvoiceHeader[]> {
    return this.inMemorySales;
  }

  async saveSalesInvoice(data: SalesInvoicePayload): Promise<{ success: boolean; invoice?: SalesInvoiceHeader; journalNo?: number; error?: string }> {
    // 1. Stock validation
    for (const line of data.lines) {
      const item = this.inMemoryItems.find(it => it.itemId === line.itemId);
      if (item) {
        const requiredQty = (line.qty || 0) * (line.unitExchange || 1);
        if (requiredQty > item.stockBalance) {
          return {
            success: false,
            error: `الرصيد المخزني غير كافٍ للصنف "${item.nameAr}"! المطلوب: ${requiredQty}، المتاح حالياً: ${item.stockBalance}.`
          };
        }
      }
    }

    // 2. Decrement stock
    for (const line of data.lines) {
      const item = this.inMemoryItems.find(it => it.itemId === line.itemId);
      if (item) {
        const requiredQty = (line.qty || 0) * (line.unitExchange || 1);
        item.stockBalance = Math.max(0, Math.round((item.stockBalance - requiredQty) * 100) / 100);
      }
    }

    const noteNo = data.noteNo || Math.floor(7000 + Math.random() * 2000);
    const journalNo = Math.floor(9000 + Math.random() * 1000);

    const newInvoice: SalesInvoiceHeader = {
      id: `INV-${Date.now()}`,
      noteNo,
      noteDate: data.noteDate,
      noteType: data.noteType,
      clientId: data.clientId,
      clientNameAr: data.clientNameAr,
      vatNo: data.vatNo,
      inventoryId: data.inventoryId,
      inventoryNameAr: data.inventoryNameAr,
      salesmanName: data.salesmanName || 'م. أحمد عزب',
      totalAmount: data.totalAmount,
      discountAmount: data.discountAmount || 0,
      netAmount: data.netAmount,
      vatAmount: data.vatAmount,
      grandTotal: data.grandTotal,
      netText: data.netText,
      journalNo,
      lines: data.lines,
      status: 'POSTED'
    };

    this.inMemorySales.unshift(newInvoice);

    // 3. Automated balanced double-entry voucher
    const debitAccId = data.noteType === 'CASH' ? '1201001' : String(data.clientId || '1204001');
    const debitAccName = data.noteType === 'CASH' ? 'الخزينة الرئيسية' : data.clientNameAr;

    const autoJournal: JournalEntryItem = {
      id: `JV-SALES-${newInvoice.noteNo}`,
      noteNo: journalNo,
      noteDate: newInvoice.noteDate,
      description: `قيد مبيعات آلي - فاتورة مبيعات رقم ${newInvoice.noteNo} لعميل (${data.clientNameAr})`,
      debitTotal: data.grandTotal,
      creditTotal: data.grandTotal,
      netText: data.netText,
      entryName: 'نظام المبيعات الآلي',
      lines: [
        {
          sr: 1,
          level5Id: debitAccId,
          level5NameAr: debitAccName,
          debit: data.grandTotal,
          credit: 0,
          description: `إثبات مستحق فاتورة مبيعات رقم ${newInvoice.noteNo}`
        },
        {
          sr: 2,
          level5Id: '4101001',
          level5NameAr: 'إيرادات المبيعات والعمليات',
          debit: 0,
          credit: data.netAmount,
          description: `صافي قيمة مبيعات فاتورة رقم ${newInvoice.noteNo}`
        },
        {
          sr: 3,
          level5Id: '2203001',
          level5NameAr: 'مصلحة الضرائب - ضريبة القيمة المضافة المستحقة (15%)',
          debit: 0,
          credit: data.vatAmount,
          description: `ضريبة القيمة المضافة المحصلة للفاتورة ${newInvoice.noteNo}`
        }
      ],
      status: 'POSTED',
      timestamp: new Date().toISOString()
    };

    this.inMemoryJournals.unshift(autoJournal);

    return {
      success: true,
      invoice: newInvoice,
      journalNo
    };
  }

  async getPurchaseBills(): Promise<PurchaseBillHeader[]> {
    return this.inMemoryPurchases;
  }

  async savePurchaseBill(data: PurchaseBillPayload): Promise<{ success: boolean; bill?: PurchaseBillHeader; journalNo?: number; error?: string }> {
    // 1. Moving average cost recalculation
    for (const line of data.lines) {
      const item = this.inMemoryItems.find(it => it.itemId === line.itemId);
      if (item) {
        const oldCost = item.averageCost || 0;
        const curStock = item.stockBalance || 0;
        const receivedBaseQty = (line.qty || 0) * (line.unitExchange || 1);
        const purchaseUnitPrice = (line.price || 0) / (line.unitExchange || 1);

        const totalStockAfter = curStock + receivedBaseQty;
        let newAverageCost = oldCost;
        if (totalStockAfter > 0) {
          newAverageCost = ((curStock * oldCost) + (receivedBaseQty * purchaseUnitPrice)) / totalStockAfter;
        }

        item.averageCost = Math.round(newAverageCost * 100) / 100;
        item.stockBalance = Math.round(totalStockAfter * 100) / 100;

        line.oldCost = oldCost;
        line.newCost = item.averageCost;
      }
    }

    const noteNo = data.noteNo || Math.floor(5000 + Math.random() * 2000);
    const journalNo = Math.floor(9000 + Math.random() * 1000);

    const newBill: PurchaseBillHeader = {
      id: `BILL-${Date.now()}`,
      noteNo,
      noteDate: data.noteDate,
      noteType: data.noteType,
      supplierId: data.supplierId,
      supplierNameAr: data.supplierNameAr,
      vatNo: data.vatNo,
      inventoryId: data.inventoryId,
      inventoryNameAr: data.inventoryNameAr,
      totalAmount: data.totalAmount,
      discountAmount: data.discountAmount || 0,
      netAmount: data.netAmount,
      vatAmount: data.vatAmount,
      grandTotal: data.grandTotal,
      netText: data.netText,
      journalNo,
      lines: data.lines,
      status: 'POSTED'
    };

    this.inMemoryPurchases.unshift(newBill);

    // 2. Automated balanced double-entry voucher
    const creditAccId = data.noteType === 'CASH' ? '1201001' : String(data.supplierId || '2201001');
    const creditAccName = data.noteType === 'CASH' ? 'الخزينة الرئيسية' : data.supplierNameAr;

    const autoJournal: JournalEntryItem = {
      id: `JV-PURCHASE-${newBill.noteNo}`,
      noteNo: journalNo,
      noteDate: newBill.noteDate,
      description: `قيد مشتريات آلي - فاتورة توريد رقم ${newBill.noteNo} من المورد (${data.supplierNameAr})`,
      debitTotal: data.grandTotal,
      creditTotal: data.grandTotal,
      netText: data.netText,
      entryName: 'نظام المشتريات والمخازن الآلي',
      lines: [
        {
          sr: 1,
          level5Id: '1206001',
          level5NameAr: 'مخزون خامات التشييد ومواد البناء',
          debit: data.netAmount,
          credit: 0,
          description: `إثبات استلام وتكلفة بضاعة فاتورة مشتريات ${newBill.noteNo}`
        },
        {
          sr: 2,
          level5Id: '1208001',
          level5NameAr: 'مصلحة الضرائب - ضريبة القيمة المضافة على المدخلات (15%)',
          debit: data.vatAmount,
          credit: 0,
          description: `ضريبة مدخلات قابلة للخصم لفاتورة مشتريات ${newBill.noteNo}`
        },
        {
          sr: 3,
          level5Id: creditAccId,
          level5NameAr: creditAccName,
          debit: 0,
          credit: data.grandTotal,
          description: `إثبات مستحق للمورد عن فاتورة مشتريات ${newBill.noteNo}`
        }
      ],
      status: 'POSTED',
      timestamp: new Date().toISOString()
    };

    this.inMemoryJournals.unshift(autoJournal);

    return {
      success: true,
      bill: newBill,
      journalNo
    };
  }

  // ==========================================
  // PHASE 4: Cost Centers, Contracting & Extracts
  // ==========================================

  async getCostCentersTree(): Promise<CostCenterNode[]> {
    return (cloudCostCentersData as any)?.costCenters || [];
  }

  async getAnalysisDimensions(): Promise<AnalysisDimension[]> {
    return cloudDimensionsData as unknown as AnalysisDimension[];
  }

  async getContracts(): Promise<ContractRecord[]> {
    return this.inMemoryContracts;
  }

  async saveContract(data: ContractPayload): Promise<{ success: boolean; contract?: ContractRecord; error?: string }> {
    const nextNo = data.contractNo || (this.inMemoryContracts.length > 0 ? Math.max(...this.inMemoryContracts.map(c => c.contractNo || 0)) + 1 : 101);
    const newContract: ContractRecord = {
      id: `CTR-${nextNo}`,
      contractNo: nextNo,
      contractType: data.contractType || 'CLIENT',
      projectNameAr: data.projectNameAr,
      costCenterId: data.costCenterId,
      partyId: data.partyId,
      partyNameAr: data.partyNameAr,
      consultantNameAr: data.consultantNameAr || 'المكتب الاستشاري العام',
      totalValue: Number(data.totalValue) || 1000000,
      advancePaymentPercent: Number(data.advancePaymentPercent) || 10,
      retentionPercent: Number(data.retentionPercent) || 5,
      startDate: data.startDate,
      endDate: data.endDate,
      status: 'ACTIVE',
      billedToDate: 0,
      backlogValue: Number(data.totalValue) || 1000000,
      notice: data.notice || 'عقد مقاولة هندسي معتمد'
    };

    this.inMemoryContracts.unshift(newContract);
    return { success: true, contract: newContract };
  }

  async getExtracts(): Promise<ExtractRecord[]> {
    return this.inMemoryExtracts;
  }

  async saveExtract(data: ExtractPayload): Promise<{ success: boolean; extract?: ExtractRecord; journalNo?: number; error?: string }> {
    const nextNo = data.extractNo || (this.inMemoryExtracts.length > 0 ? Math.max(...this.inMemoryExtracts.map(e => e.extractNo || 0)) + 1 : 1);
    const journalNo = 9300 + (this.inMemoryExtracts.length + 1);

    const currentWork = Number(data.currentWorkTotal) || 0;
    const advPercent = Number(data.advanceDeductionPercent) || 10;
    const retPercent = Number(data.retentionDeductionPercent) || 5;
    const advAmount = Math.round(currentWork * (advPercent / 100));
    const retAmount = Math.round(currentWork * (retPercent / 100));
    const otherDed = Number(data.otherDeductions) || 0;
    const netPayable = currentWork - advAmount - retAmount - otherDed;

    const newExtract: ExtractRecord = {
      id: `EXT-${data.contractNo}-${nextNo}`,
      extractNo: nextNo,
      extractDate: data.extractDate,
      extractType: data.extractType || 'OWNER',
      contractNo: data.contractNo,
      projectNameAr: data.projectNameAr,
      costCenterId: data.costCenterId,
      partyId: data.partyId,
      partyNameAr: data.partyNameAr,
      consultantNameAr: data.consultantNameAr || 'استشاري المشروع',
      periodFrom: data.periodFrom || '',
      periodTo: data.periodTo || '',
      currentWorkTotal: currentWork,
      advanceDeductionPercent: advPercent,
      advanceDeductionAmount: advAmount,
      retentionDeductionPercent: retPercent,
      retentionDeductionAmount: retAmount,
      otherDeductions: otherDed,
      netPayable,
      netPayableText: data.netPayableText || '',
      vatRate: data.vatRate || 0,
      vatAmount: data.vatAmount || 0,
      totalWithVat: data.totalWithVat || netPayable,
      journalNo,
      status: 'APPROVED',
      lines: data.lines || []
    };

    this.inMemoryExtracts.unshift(newExtract);

    // Update contract billed to date
    const contract = this.inMemoryContracts.find(c => c.contractNo === data.contractNo);
    if (contract) {
      contract.billedToDate = (contract.billedToDate || 0) + currentWork;
      contract.backlogValue = Math.max(0, contract.totalValue - contract.billedToDate);
    }

    // Generate balancing double-entry GL journal
    let journalLines = [];
    if (data.extractType === 'OWNER') {
      journalLines = [
        {
          sr: 1,
          level5Id: String(data.partyId || '1204001'),
          level5NameAr: data.partyNameAr,
          debit: netPayable,
          credit: 0,
          description: `صافي مستحق مستخلص جاري رقم ${nextNo} - مشروع ${data.projectNameAr}`
        },
        {
          sr: 2,
          level5Id: '1209001',
          level5NameAr: 'أمانات ضمان أعمال محتجزة لدى العملاء (5%)',
          debit: retAmount,
          credit: 0,
          description: `استقطاع ضمان أعمال مستخلص ${nextNo}`
        },
        {
          sr: 3,
          level5Id: '1205001',
          level5NameAr: 'حساب إطفاء واسترداد الدفعة المقدمة (10%)',
          debit: advAmount + otherDed,
          credit: 0,
          description: `استقطاع إطفاء دفعة مقدمة مستخلص ${nextNo}`
        },
        {
          sr: 4,
          level5Id: '4102001',
          level5NameAr: 'إيرادات عقود المقاولات والأعمال الإنشائية المنجزة',
          debit: 0,
          credit: currentWork,
          description: `إثبات إيراد الأعمال المنجزة مستخلص ${nextNo} - مركز تكلفة ${data.costCenterId}`
        }
      ];
    } else {
      journalLines = [
        {
          sr: 1,
          level5Id: '3101001',
          level5NameAr: 'تكاليف مشروعات - مقاولي باطن وأعمال تنفيذية',
          debit: currentWork,
          credit: 0,
          description: `تكلفة أعمال منجزة مستخلص باطن رقم ${nextNo} - مقاول (${data.partyNameAr})`
        },
        {
          sr: 2,
          level5Id: String(data.partyId || '2202001'),
          level5NameAr: data.partyNameAr,
          debit: 0,
          credit: netPayable,
          description: `صافي مستحق لمقاول الباطن مستخلص رقم ${nextNo}`
        },
        {
          sr: 3,
          level5Id: '2205001',
          level5NameAr: 'أمانات محتجزة لمقاولي الباطن (ضمان أعمال 5%)',
          debit: 0,
          credit: retAmount,
          description: `استقطاع ضمان أعمال محتجز لمقاول الباطن مستخلص ${nextNo}`
        },
        {
          sr: 4,
          level5Id: '2104001',
          level5NameAr: 'استرداد دفعات مقدمة مقاولي باطن',
          debit: 0,
          credit: advAmount + otherDed,
          description: `استرداد دفعة مقدمة مقاول باطن مستخلص ${nextNo}`
        }
      ];
    }

    const autoJournal: JournalEntryItem = {
      id: `JV-EXTRACT-${data.contractNo}-${nextNo}`,
      noteNo: journalNo,
      noteDate: newExtract.extractDate,
      description: `قيد مستخلص مقاولات آلي رقم ${nextNo} - ${data.projectNameAr} (${data.extractType === 'OWNER' ? 'مستخلص مالك' : 'مستخلص باطن'})`,
      debitTotal: currentWork,
      creditTotal: currentWork,
      netText: data.netPayableText,
      entryName: 'نظام محاسبة المشروعات والمستخلصات الآلي',
      lines: journalLines,
      status: 'POSTED',
      timestamp: new Date().toISOString()
    };

    this.inMemoryJournals.unshift(autoJournal);

    return {
      success: true,
      extract: newExtract,
      journalNo
    };
  }

  // Phase 5: Financial BI & Reports (Cloud Fallback)
  async getTrialBalance(level = 4, startDate = '2025-01-01', endDate = '2026-12-31', costcenterId?: number): Promise<TrialBalanceReportData> {
    try {
      const params = new URLSearchParams({ level: String(level), startDate, endDate });
      if (costcenterId) params.append('costcenterId', String(costcenterId));
      const res = await fetch(`/api/finance/reports/trial-balance?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback below
    }

    const items = [
      { accountCode: '1101', accountNameAr: 'الأصول الثابتة (سيارات ومعدات)', level, openingDebit: 12400000, openingCredit: 0, periodDebit: 0, periodCredit: 0, endingDebit: 12400000, endingCredit: 0 },
      { accountCode: '1102', accountNameAr: 'مجمع إهلاك أصول ثابتة', level, openingDebit: 0, openingCredit: 2600000, periodDebit: 0, periodCredit: 600000, endingDebit: 0, endingCredit: 3200000 },
      { accountCode: '1201', accountNameAr: 'الخزينة النقدية الرئيسية', level, openingDebit: 2150000, openingCredit: 0, periodDebit: 4850000, periodCredit: 3215000, endingDebit: 3785000, endingCredit: 0 },
      { accountCode: '1202', accountNameAr: 'البنوك والحسابات الجارية', level, openingDebit: 8500000, openingCredit: 0, periodDebit: 12600000, periodCredit: 9650000, endingDebit: 11450000, endingCredit: 0 },
      { accountCode: '1204', accountNameAr: 'حسابات العملاء ومدينو المشروعات', level, openingDebit: 11200000, openingCredit: 0, periodDebit: 18400000, periodCredit: 14750000, endingDebit: 14850000, endingCredit: 0 },
      { accountCode: '1207', accountNameAr: 'مخزون الخامات والتوريدات', level, openingDebit: 3900000, openingCredit: 0, periodDebit: 6200000, periodCredit: 5210000, endingDebit: 4890000, endingCredit: 0 },
      { accountCode: '1209', accountNameAr: 'أمانات ضمان أعمال محتجزة لدى العملاء', level, openingDebit: 1450000, openingCredit: 0, periodDebit: 1200000, periodCredit: 0, endingDebit: 2650000, endingCredit: 0 },
      { accountCode: '2101', accountNameAr: 'قروض وتسهيلات بنكية طويلة الأجل', level, openingDebit: 0, openingCredit: 4500000, periodDebit: 0, periodCredit: 0, endingDebit: 0, endingCredit: 4500000 },
      { accountCode: '2104', accountNameAr: 'دفعات مقدمة مقبوضة من العملاء', level, openingDebit: 0, openingCredit: 3200000, periodDebit: 1450000, periodCredit: 2900000, endingDebit: 0, endingCredit: 4650000 },
      { accountCode: '2202', accountNameAr: 'الموردون ومقاولو الباطن الدائنين', level, openingDebit: 0, openingCredit: 8900000, periodDebit: 9800000, periodCredit: 12150000, endingDebit: 0, endingCredit: 11250000 },
      { accountCode: '2205', accountNameAr: 'أمانات محتجزة لمقاولي الباطن', level, openingDebit: 0, openingCredit: 1100000, periodDebit: 0, periodCredit: 750000, endingDebit: 0, endingCredit: 1850000 },
      { accountCode: '3101', accountNameAr: 'رأس المال المدفوع', level, openingDebit: 0, openingCredit: 18000000, periodDebit: 0, periodCredit: 0, endingDebit: 0, endingCredit: 18000000 },
      { accountCode: '3201', accountNameAr: 'الاحتياطيات والأرباح المرحلة', level, openingDebit: 0, openingCredit: 5450000, periodDebit: 0, periodCredit: 0, endingDebit: 0, endingCredit: 5450000 },
      { accountCode: '4102', accountNameAr: 'إيرادات عقود ومستخلصات المشروعات', level, openingDebit: 0, openingCredit: 0, periodDebit: 0, periodCredit: 38400000, endingDebit: 0, endingCredit: 38400000 },
      { accountCode: '4101', accountNameAr: 'إيرادات مبيعات وتوريدات تجارية', level, openingDebit: 0, openingCredit: 0, periodDebit: 0, periodCredit: 5830000, endingDebit: 0, endingCredit: 5830000 },
      { accountCode: '5101', accountNameAr: 'تكاليف المشروعات ومقاولي الباطن والمواد', level, openingDebit: 0, openingCredit: 0, periodDebit: 32400000, periodCredit: 0, endingDebit: 32400000, endingCredit: 0 },
      { accountCode: '5201', accountNameAr: 'المصروفات العمومية والإدارية والتشغيلية', level, openingDebit: 0, openingCredit: 0, periodDebit: 5300000, periodCredit: 0, endingDebit: 5300000, endingCredit: 0 }
    ];

    let totalOD = 0, totalOC = 0, totalPD = 0, totalPC = 0, totalED = 0, totalEC = 0;
    items.forEach(it => {
      totalOD += it.openingDebit;
      totalOC += it.openingCredit;
      totalPD += it.periodDebit;
      totalPC += it.periodCredit;
      totalED += it.endingDebit;
      totalEC += it.endingCredit;
    });

    return {
      asOfDate: new Date().toISOString().split('T')[0],
      startDate,
      endDate,
      totalOpeningDebit: totalOD,
      totalOpeningCredit: totalOC,
      totalPeriodDebit: totalPD,
      totalPeriodCredit: totalPC,
      totalEndingDebit: totalED,
      totalEndingCredit: totalEC,
      isBalanced: totalED === totalEC,
      difference: Math.abs(totalED - totalEC),
      items
    };
  }

  async getIncomeStatement(startDate = '2026-01-01', endDate = '2026-12-31', costcenterId?: number): Promise<IncomeStatementReportData> {
    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (costcenterId) params.append('costcenterId', String(costcenterId));
      const res = await fetch(`/api/finance/reports/income-statement?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    return {
      periodName: 'السنة المالية 2026',
      startDate,
      endDate,
      operatingRevenues: [],
      totalOperatingRevenues: 0,
      costOfRevenues: [],
      totalCostOfRevenues: 0,
      grossProfit: 0,
      grossMarginPercent: 0,
      operatingExpenses: [],
      totalOperatingExpenses: 0,
      operatingProfit: 0,
      operatingMarginPercent: 0,
      otherIncomesExpenses: [],
      netProfitBeforeTax: 0,
      estimatedTax: 0,
      netProfitAfterTax: 0,
      netMarginPercent: 0
    };
  }

  async getBalanceSheet(asOfDate = '2026-12-31'): Promise<BalanceSheetReportData> {
    try {
      const params = new URLSearchParams({ asOfDate });
      const res = await fetch(`/api/finance/reports/balance-sheet?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    return {
      asOfDate,
      currentAssets: { titleAr: 'الأصول المتداولة (Current Assets)', lines: [], total: 0 },
      nonCurrentAssets: { titleAr: 'الأصول غير المتداولة والثابتة (Non-Current Assets)', lines: [], total: 0 },
      totalAssets: 0,
      currentLiabilities: { titleAr: 'الالتزامات المتداولة (Current Liabilities)', lines: [], total: 0 },
      nonCurrentLiabilities: { titleAr: 'الالتزامات طويلة الأجل (Long-Term Liabilities)', lines: [], total: 0 },
      totalLiabilities: 0,
      equity: { titleAr: 'حقوق الملكية ورأس المال (Stockholders Equity)', lines: [], total: 0 },
      totalEquity: 0,
      totalLiabilitiesAndEquity: 0,
      isBalanced: true,
      difference: 0
    };
  }

  async getStatementOfAccount(level5Id: string, startDate = '2025-01-01', endDate = '2026-12-31', costcenterId?: number, analysisId?: number): Promise<StatementOfAccountReportData> {
    const cleanId = String(level5Id || '').trim().replace(/^L[1-5]-/i, '');
    try {
      const params = new URLSearchParams({ level5Id: cleanId, accountId: cleanId, startDate, endDate });
      if (costcenterId) params.append('costcenterId', String(costcenterId));
      if (analysisId) params.append('analysisId', String(analysisId));
      const res = await fetch(`/api/finance/reports/statement-of-account?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    return {
      level5Id,
      accountNameAr: 'حساب تفصيلي',
      startDate,
      endDate,
      openingBalance: 0,
      totalDebit: 0,
      totalCredit: 0,
      endingBalance: 0,
      transactions: []
    };
  }

  async getCfoExecutiveMetrics(): Promise<CfoExecutiveMetrics> {
    try {
      const res = await fetch('/api/finance/reports/cfo-metrics');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    return {
      netRevenue: 0,
      grossProfit: 0,
      grossMarginPercent: 0,
      operatingProfit: 0,
      operatingMarginPercent: 0,
      netProfit: 0,
      netMarginPercent: 0,
      totalAssets: 0,
      workingCapital: 0,
      currentRatio: 0,
      quickRatio: 0,
      totalReceivables: 0,
      totalPayables: 0,
      monthlyTrends: [],
      projectMargins: [],
      expenseCategories: []
    };
  }
}
