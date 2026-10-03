import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { useDatabase } from '../../../services/federation/DatabaseContext';
import { FinancialHeader } from './FinancialHeader';
import { ChartOfAccountsTree } from './ChartOfAccountsTree';
import { TreasuryModule } from './TreasuryModule';
import { VouchersManager } from './VouchersManager';
import { ChequesPortfolio } from './ChequesPortfolio';
import { GeneralLedgerModule } from './GeneralLedgerModule';
import { SalesModule } from './SalesModule';
import { ProcurementModule } from './ProcurementModule';
import { CostCentersModule } from './CostCentersModule';
import { ContractsModule } from './ContractsModule';
import { ExtractsModule } from './ExtractsModule';
import { ReportsModule } from './ReportsModule';
import {
  Layers,
  HardHat,
  Database,
  Lock,
  FileCheck,
  ShoppingCart,
  Package,
  Building,
  BarChart3
} from 'lucide-react';

interface FinancialAffairsModuleProps {
  activeSubItemId: string | null;
}

export const FinancialAffairsModule: React.FC<FinancialAffairsModuleProps> = ({ activeSubItemId }) => {
  const { t } = useLanguage();
  const { selectItem } = useNavigation();
  const { activeDatabase } = useDatabase();

  const currentTab = activeSubItemId || 'fin_chart';
  const [projectSubTab, setProjectSubTab] = React.useState<'EXTRACTS' | 'CONTRACTS'>('EXTRACTS');

  // Render Sub-Views
  const renderActiveView = () => {
    switch (currentTab) {
      case 'fin_chart':
        return (
          <div className="w-full space-y-5 animate-in fade-in duration-200">
            <FinancialHeader />
            <ChartOfAccountsTree />
          </div>
        );
      case 'fin_treasury':
        return <TreasuryModule />;
      case 'fin_vouchers':
        return <VouchersManager />;
      case 'fin_cheques':
        return <ChequesPortfolio />;
      case 'fin_journals':
        return <GeneralLedgerModule />;
      case 'fin_sales':
        return <SalesModule />;
      case 'fin_procurement':
      case 'fin_purchases':
        return <ProcurementModule />;
      case 'fin_costcenters':
      case 'fin_cost_centers':
        return <CostCentersModule />;
      case 'fin_contracts':
        return <ContractsModule />;
      case 'fin_projects':
        return (
          <div className="w-full space-y-4">
            <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] w-fit shadow-xs">
              <button
                onClick={() => setProjectSubTab('EXTRACTS')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  projectSubTab === 'EXTRACTS'
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
                }`}
              >
                <HardHat className="w-4 h-4" />
                <span>{t('المستخلصات الجارية وتكاليف المشروعات (Extracts & WIP)', 'Extracts & WIP Costing')}</span>
              </button>

              <button
                onClick={() => setProjectSubTab('CONTRACTS')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  projectSubTab === 'CONTRACTS'
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>{t('سجل عقود المشروعات ومقاولي الباطن (Contracts Portfolio)', 'Contracts Portfolio')}</span>
              </button>
            </div>

            {projectSubTab === 'EXTRACTS' ? <ExtractsModule /> : <ContractsModule />}
          </div>
        );
      case 'fin_reports':
        return <ReportsModule />;
      default:
        break;
    }

    // Phase 3 to 6 Enterprise Staged Handlers
    const SUB_MODULE_INFO: Record<
      string,
      {
        titleAr: string;
        titleEn: string;
        icon: React.ElementType;
        color: string;
        phase: string;
        legacyTables: string[];
        descriptionAr: string;
      }
    > = {
      fin_sales: {
        titleAr: 'المبيعات والتجارة والفوترة الإلكترونية (ZATCA)',
        titleEn: 'Commercial Sales & E-Invoicing',
        icon: ShoppingCart,
        color: '#D97706',
        phase: 'المرحلة الثالثة (Phase 3)',
        legacyTables: ['dbo.Sales_Head', 'dbo.Sales_Details', 'dbo.TLVCls'],
        descriptionAr: 'الفواتير ونقاط البيع، باركود ZATCA Base64 TLV، وخصم المخزون التلقائي.',
      },
      fin_procurement: {
        titleAr: 'المشتريات والمخزون المالي',
        titleEn: 'Procurement & Inventory Valuation',
        icon: Package,
        color: '#B45309',
        phase: 'المرحلة الرابعة (Phase 4)',
        legacyTables: ['dbo.Purchase_Head', 'dbo.Purchase_Details', 'dbo.Items_Details'],
        descriptionAr: 'فواتير الشراء، ضريبة المدخلات، وخوارزمية متوسط التكلفة المرجح المتحرك (Moving Average).',
      },
      fin_costcenters: {
        titleAr: 'مراكز التكلفة والأبعاد التحليلية',
        titleEn: 'Cost Centers & Sub-Ledger Dimensions',
        icon: Building,
        color: '#3B7A57',
        phase: 'المرحلة الرابعة (Phase 4)',
        legacyTables: ['dbo.Costcenters', 'dbo.Accounts_Analysis'],
        descriptionAr: '32 مركز تكلفة نشط و13 بعداً تحليلياً لمتابعة تكاليف المشاريع والأقسام بدقة.',
      },
      fin_projects: {
        titleAr: 'محاسبة المشروعات والمستخلصات',
        titleEn: 'Contracting & Project Costing',
        icon: HardHat,
        color: '#15803D',
        phase: 'المرحلة الخامسة (Phase 5)',
        legacyTables: ['dbo.Contracts_Head', 'dbo.Extracts_Head', 'dbo.Extracts_Details'],
        descriptionAr: 'مستخلصات المالك ومقاولي الباطن، استقطاعات الدفعة المقدمة وضمان الأعمال.',
      },
      fin_reports: {
        titleAr: 'التقارير المالية والذكاء التحليلي',
        titleEn: 'Financial BI & Reporting Engine',
        icon: BarChart3,
        color: '#6366F1',
        phase: 'المرحلة السادسة (Phase 6)',
        legacyTables: ['dbo.GeneralLedger_View', 'dbo.Level5_View', 'dbo.BalanceSheet_View'],
        descriptionAr: 'ميزان المراجعة، قائمة الدخل، الميزانية العمومية، وكشف الحساب التحليلي دون Crystal Reports.',
      },
    };

    const currentModule = SUB_MODULE_INFO[currentTab] || {
      titleAr: 'الشؤون المالية المتقدمة',
      titleEn: 'Advanced Finance',
      icon: Layers,
      color: '#EBB34D',
      phase: 'المرحلة القادمة',
      legacyTables: [activeDatabase || 'Tarabot_Data_2026'],
      descriptionAr: 'وحدة محاسبية متقدمة قيد التنفيذ وفق خطة العمل التنفيذية المعتمدة.',
    };

    const Icon = currentModule.icon;

    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        {/* Overview Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-gradient-to-r from-[#FBF9F5] via-[#F3EFE6] to-[#EAE4D7]/70 dark:from-[#17231A] dark:via-[#131E15] dark:to-[#0E1610] p-6 sm:p-8 shadow-xs">
          <div className="max-w-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center mb-1">
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D] border border-[#EBB34D]/30">
                {currentModule.phase}
              </span>
              <span className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                {t('الشؤون المالية / الربط المؤسسي', 'Finance / Enterprise Bridge')}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#1A241C] dark:text-[#F3EFE6] tracking-tight">
              {currentModule.titleAr}
            </h2>

            <p className="text-xs sm:text-sm text-[#5C665E] dark:text-[#8FA392] leading-relaxed">
              {currentModule.descriptionAr}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => selectItem('finance', 'fin_chart')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#EBB34D] text-[#0E1610] hover:bg-[#D99B26] shadow-xs transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>{t('العودة إلى دليل الحسابات (المرحلة 1)', 'Back to Chart of Accounts (Phase 1)')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Target Data Mapping Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
              <Database className="w-4 h-4 text-[#EBB34D]" />
              <span>{t(`الجداول المستهدفة من ${activeDatabase}`, 'Target SQL Server Tables')}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {currentModule.legacyTables.map(tbl => (
                <span
                  key={tbl}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#F3EFE6] dark:bg-[#1A241C] text-[#EBB34D] dark:text-[#EBB34D] border border-[#E0D9CB] dark:border-[#243628]"
                >
                  {tbl}
                </span>
              ))}
            </div>

            <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              {t(
                'سيتم تفعيل هذه الشاشة تباعاً فور اعتماد المرحلة الأولى والثانية.',
                'This screen will be activated sequentially following approval of Phases 1 & 2.'
              )}
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
              <Lock className="w-4 h-4 text-[#D97706]" />
              <span>{t('ضوابط التدقيق المحاسبي المعتمدة', 'Auditing Controls')}</span>
            </div>

            <ul className="text-xs text-[#5C665E] dark:text-[#8FA392] space-y-1.5 list-disc list-inside">
              <li>{t('توليد القيود المزدوجة المتزنة آلياً (Debit = Credit).', 'Automated balanced double-entry generation.')}</li>
              <li>{t('تحويل الأرقام إلى تفقيط عربي معتمد (Tafqeet).', 'Integrated Arabic number-to-words converter.')}</li>
              <li>{t('الربط المباشر مع مصفوفة الصلاحيات (RBAC).', 'Enforced financial RBAC matrix.')}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Render Active View Selected via Sidebar */}
      {renderActiveView()}
    </div>
  );
};
