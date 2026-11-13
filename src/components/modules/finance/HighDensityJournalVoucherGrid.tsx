/**
 * ECO ERP - High-Density Keyboard-Driven Journal Voucher Grid
 * Replicates Telerik / Desktop Enterprise Accounting Workflows
 * - Enter: Jumps to next editable cell / auto-creates row at grid end
 * - Insert / Ctrl+Down: Inserts row
 * - Ctrl+Del: Deletes row
 * - Typeahead account search by Code or Arabic Name
 * - Dynamic Balancing HUD with Decimal.js Invariant Checking (Difference === 0.0000)
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Decimal } from 'decimal.js';
import {
  Plus,
  Trash2,
  Scale,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  Database,
} from 'lucide-react';
import { FinancialClient, ClientVoucherLine, DatabaseFleetItem } from '../../../services/financialClient';
import { tafqeet } from '../../../utils/tafqeet';

interface HighDensityGridProps {
  onSaved?: (noteNo: number) => void;
  onClose?: () => void;
  initialVoucher?: {
    noteNo: number;
    noteDate: string;
    description: string;
    lines: ClientVoucherLine[];
  };
}

interface AccountOption {
  code: string;
  nameAr: string;
  accountNature: number; // 0: Debit, 1: Credit
}

interface CostCenterOption {
  id: string;
  code: string;
  nameAr: string;
}

export const HighDensityJournalVoucherGrid: React.FC<HighDensityGridProps> = ({
  onSaved,
  onClose,
  initialVoucher,
}) => {
  const financialClient = FinancialClient.getInstance();

  // Multi-database fleet state
  const [databases, setDatabases] = useState<DatabaseFleetItem[]>([]);
  const [activeDbKey, setActiveDbKey] = useState<string>(financialClient.getActiveDatabaseKey());

  // Vouchers Header State
  const [noteNo, setNoteNo] = useState<number>(initialVoucher?.noteNo || 1001);
  const [noteDate, setNoteDate] = useState<string>(
    initialVoucher?.noteDate || new Date().toISOString().split('T')[0]
  );
  const [generalDescription, setGeneralDescription] = useState<string>(
    initialVoucher?.description || 'قيد تسوية وإقفال عام'
  );
  const [entryName] = useState<string>('مدير النظام / رئيس الحسابات');

  // Accounts & Lookups
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenterOption[]>([]);

  // Grid Lines State
  const [lines, setLines] = useState<ClientVoucherLine[]>(() => {
    if (initialVoucher && initialVoucher.lines.length > 0) {
      return initialVoucher.lines;
    }
    return [
      {
        sr: 1,
        level5Id: '1201001',
        level5NameAr: 'الخزينة',
        description: 'إيداع نقدي بالخزينة',
        debit: '5000.00',
        credit: '0.00',
        costcenterId: '0',
        costcenterNameAr: 'مركز تكلفة عام',
      },
      {
        sr: 2,
        level5Id: '1202001',
        level5NameAr: 'حساب المستقبل ايجى بنك0041605186001',
        description: 'تحويل بنكي مقابل إيداع',
        debit: '0.00',
        credit: '5000.00',
        costcenterId: '0',
        costcenterNameAr: 'مركز تكلفة عام',
      },
    ];
  });

  // Active Grid Focus Cell: [rowIndex, colName]
  type ColumnKey = 'account' | 'description' | 'costcenter' | 'debit' | 'credit';
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: ColumnKey }>({ row: 0, col: 'account' });

  // Typeahead search dropdown state
  const [typeaheadQuery, setTypeaheadQuery] = useState<{ row: number; text: string } | null>(null);
  const [typeaheadIndex, setTypeaheadIndex] = useState<number>(0);

  // Status & Notifications
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Table cell input refs matrix: `${row}_${col}`
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // 1. Initial Load: Databases, Accounts, CostCenters, Next Note No
  useEffect(() => {
    financialClient.getDatabases().then(setDatabases);

    financialClient.getChartOfAccountsTree().then((tree) => {
      const leaves: AccountOption[] = [];
      const traverse = (nodes: any[]) => {
        for (const n of nodes) {
          if (n.isLeaf || n.level === 5) {
            leaves.push({
              code: String(n.code),
              nameAr: n.nameAr,
              accountNature: n.accountNature ?? 0,
            });
          }
          if (n.children && n.children.length > 0) {
            traverse(n.children);
          }
        }
      };
      traverse(tree);
      setAccounts(leaves);
    });

    if (!initialVoucher?.noteNo) {
      financialClient.getNextVoucherNumber().then(setNoteNo);
    }

    setCostCenters([
      { id: '0', code: '0', nameAr: 'مركز تكلفة عام' },
      { id: '52001', code: '52001', nameAr: 'مشروع كفر ابراش الشرقية' },
      { id: '52002', code: '52002', nameAr: 'سجل مدنى البلاشون الشرقية' },
      { id: '52027', code: '52027', nameAr: 'سجل مدنى ابوتيج اسيوط' },
      { id: '51', code: '51', nameAr: 'المشروعات العامة' },
    ]);
  }, [activeDbKey]);

  // Switch active database
  const handleDatabaseChange = (newKey: string) => {
    setActiveDbKey(newKey);
    financialClient.setActiveDatabaseKey(newKey);
    setSuccessBanner(`تم التبديل بنجاح إلى قاعدة البيانات: [${newKey}]`);
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  // 2. High-Precision Decimal Balancing Invariant
  const { totalDebit, totalCredit, difference, isBalanced } = useMemo(() => {
    let td = new Decimal(0);
    let tc = new Decimal(0);

    for (const line of lines) {
      const d = new Decimal(line.debit || 0);
      const c = new Decimal(line.credit || 0);
      td = td.plus(d);
      tc = tc.plus(c);
    }

    const diff = td.minus(tc).abs();
    const balanced = diff.isZero() && td.greaterThan(0);

    return {
      totalDebit: td,
      totalCredit: tc,
      difference: diff,
      isBalanced: balanced,
    };
  }, [lines]);

  const tafqeetSentence = useMemo(() => {
    if (isBalanced && totalDebit.greaterThan(0)) {
      return tafqeet(totalDebit.toNumber(), 'EGP');
    }
    return '';
  }, [isBalanced, totalDebit]);

  // Focus helper
  const focusCell = useCallback((row: number, col: ColumnKey) => {
    setFocusedCell({ row, col });
    const key = `${row}_${col}`;
    setTimeout(() => {
      const el = inputRefs.current.get(key);
      if (el) {
        el.focus();
        el.select();
      }
    }, 10);
  }, []);

  // Filtered accounts for typeahead
  const filteredAccounts = useMemo(() => {
    if (!typeaheadQuery || !typeaheadQuery.text) return [];
    const q = typeaheadQuery.text.toLowerCase().trim();
    return accounts
      .filter((a) => a.code.toLowerCase().includes(q) || a.nameAr.toLowerCase().includes(q))
      .slice(0, 8);
  }, [accounts, typeaheadQuery]);

  // Update line field
  const updateLine = (index: number, field: keyof ClientVoucherLine, value: any) => {
    setLines((prev) => {
      const next = [...prev];
      const target = { ...next[index], [field]: value };

      // Mutual exclusivity between Debit & Credit
      if (field === 'debit' && Number(value) > 0) {
        target.credit = '0.00';
      } else if (field === 'credit' && Number(value) > 0) {
        target.debit = '0.00';
      }

      next[index] = target;
      return next;
    });
  };

  // Insert row below current
  const insertRowAt = (index: number) => {
    setLines((prev) => {
      const next = [...prev];
      const newSr = index + 2;
      const defaultAcc = accounts[newSr % (accounts.length || 1)] || {
        code: '1201001',
        nameAr: 'الخزينة',
      };
      next.splice(index + 1, 0, {
        sr: newSr,
        level5Id: defaultAcc.code,
        level5NameAr: defaultAcc.nameAr,
        description: generalDescription,
        debit: '0.00',
        credit: '0.00',
        costcenterId: '0',
        costcenterNameAr: 'مركز تكلفة عام',
      });
      // Re-index SRs
      return next.map((line, idx) => ({ ...line, sr: idx + 1 }));
    });
    focusCell(index + 1, 'account');
  };

  // Delete row at index
  const deleteRowAt = (index: number) => {
    if (lines.length <= 2) {
      setErrorBanner('يجب أن يحتوي القيد المحاسبي على سطرين على الأقل (طرف مدين وطرف دائن).');
      setTimeout(() => setErrorBanner(null), 4000);
      return;
    }
    setLines((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      return next.map((line, idx) => ({ ...line, sr: idx + 1 }));
    });
    const nextRow = Math.max(0, index - 1);
    focusCell(nextRow, 'account');
  };

  // Select account from typeahead
  const selectAccount = (row: number, acc: AccountOption) => {
    updateLine(row, 'level5Id', acc.code);
    updateLine(row, 'level5NameAr', acc.nameAr);
    setTypeaheadQuery(null);
    focusCell(row, 'description');
  };

  // Auto-Balance action
  const handleAutoBalance = () => {
    if (totalDebit.equals(totalCredit)) return;
    const diff = totalDebit.minus(totalCredit);
    const lastIdx = lines.length - 1;

    setLines((prev) => {
      const next = [...prev];
      const target = { ...next[lastIdx] };

      if (diff.greaterThan(0)) {
        // Debit is larger -> add diff to credit
        const existingCredit = new Decimal(target.credit || 0);
        target.credit = existingCredit.plus(diff).toFixed(2);
        target.debit = '0.00';
      } else {
        // Credit is larger -> add diff to debit
        const existingDebit = new Decimal(target.debit || 0);
        target.debit = existingDebit.plus(diff.abs()).toFixed(2);
        target.credit = '0.00';
      }

      next[lastIdx] = target;
      return next;
    });
  };

  // Keyboard navigation handler per cell
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    colKey: ColumnKey
  ) => {
    // 1. Insert row: Insert OR Ctrl+Down
    if (e.key === 'Insert' || (e.ctrlKey && e.key === 'ArrowDown')) {
      e.preventDefault();
      insertRowAt(rowIndex);
      return;
    }

    // 2. Delete row: Ctrl+Delete
    if (e.ctrlKey && e.key === 'Delete') {
      e.preventDefault();
      deleteRowAt(rowIndex);
      return;
    }

    // 3. Dropdown navigation when typeahead is active
    if (colKey === 'account' && typeaheadQuery && filteredAccounts.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setTypeaheadIndex((prev) => (prev + 1) % filteredAccounts.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setTypeaheadIndex((prev) => (prev - 1 + filteredAccounts.length) % filteredAccounts.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredAccounts[typeaheadIndex];
        if (selected) {
          selectAccount(rowIndex, selected);
          return;
        }
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setTypeaheadQuery(null);
        return;
      }
    }

    // 4. Enter Key Workflow (Telerik Desktop Jump)
    if (e.key === 'Enter') {
      e.preventDefault();

      if (colKey === 'account') {
        // If exact code match, resolve name
        const match = accounts.find((a) => a.code === lines[rowIndex].level5Id);
        if (match) updateLine(rowIndex, 'level5NameAr', match.nameAr);
        focusCell(rowIndex, 'description');
      } else if (colKey === 'description') {
        focusCell(rowIndex, 'costcenter');
      } else if (colKey === 'costcenter') {
        focusCell(rowIndex, 'debit');
      } else if (colKey === 'debit') {
        const dVal = parseFloat(String(lines[rowIndex].debit || '0'));
        if (dVal > 0) {
          // If debit entered, jump to next row
          if (rowIndex === lines.length - 1) {
            insertRowAt(rowIndex);
          } else {
            focusCell(rowIndex + 1, 'account');
          }
        } else {
          focusCell(rowIndex, 'credit');
        }
      } else if (colKey === 'credit') {
        if (rowIndex === lines.length - 1) {
          insertRowAt(rowIndex);
        } else {
          focusCell(rowIndex + 1, 'account');
        }
      }
      return;
    }

    // 5. Arrow Up/Down vertical grid navigation
    if (e.key === 'ArrowDown' && !e.ctrlKey) {
      if (rowIndex < lines.length - 1) {
        e.preventDefault();
        focusCell(rowIndex + 1, colKey);
      }
    } else if (e.key === 'ArrowUp' && !e.ctrlKey) {
      if (rowIndex > 0) {
        e.preventDefault();
        focusCell(rowIndex - 1, colKey);
      }
    }
  };

  // Submit and Post Voucher
  const handleSaveVoucher = async () => {
    setErrorBanner(null);
    setSuccessBanner(null);

    if (!isBalanced) {
      setErrorBanner(
        `لا يمكن حفظ وترحيل القيد! القيد غير متوازن محاسبياً (الفارق: ${difference.toFixed(4)} ج.م). يجب أن يتساوى المدين مع الدائن بدقة.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await financialClient.saveAndPostVoucher({
        noteNo,
        noteDate,
        description: generalDescription,
        entryName,
        noteNetText: tafqeetSentence,
        lines,
      });

      setSuccessBanner(result.message);
      if (onSaved) onSaved(result.noteNo);

      // Auto-advance next Note No
      const next = await financialClient.getNextVoucherNumber();
      setNoteNo(next);
    } catch (err: any) {
      setErrorBanner(err.message || 'حدث خطأ أثناء معالجة وترحيل القيد المحاسبي');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#FBF9F5] dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6] font-sans select-none rounded-2xl border border-[#E0D9CB] dark:border-[#243628] shadow-2xl overflow-hidden" dir="rtl">
      {/* 1. Executive Desktop Command Ribbon */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3 bg-white dark:bg-[#121B14] border-b border-[#E0D9CB] dark:border-[#243628] text-xs gap-3 shrink-0">
        {/* Left Side: System Title & Multi-Database Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EAF3EB] dark:bg-[#2A3F30] border border-[#B8D8BC] dark:border-[#3D5A45] rounded-xl text-[#245E33] dark:text-[#A3CFAC] font-bold shadow-2xs">
            <Scale className="w-4 h-4 text-[#059669] dark:text-[#34D399]" />
            <span>سند قيد اليومية العامة (General Ledger Voucher)</span>
          </div>

          {/* Database Switcher */}
          <div className="flex items-center gap-2 bg-[#F3EFE6] dark:bg-[#1A241C] px-3 py-1.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628]">
            <Database className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
            <span className="text-[#5C665E] dark:text-[#8FA392] font-medium">قاعدة البيانات:</span>
            <select
              value={activeDbKey}
              onChange={(e) => handleDatabaseChange(e.target.value)}
              className="bg-transparent text-[#1A241C] dark:text-[#F3EFE6] font-bold text-xs border-none outline-none cursor-pointer"
            >
              {databases.map((db) => (
                <option key={db.name} value={db.name} className="bg-white dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6]">
                  {db.displayNameAr} ({db.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Side: Keyboard Shortcuts Badge & Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-[#5C665E] dark:text-[#8FA392] px-3 py-1 bg-[#F3EFE6] dark:bg-[#1A241C] rounded-xl border border-[#E0D9CB] dark:border-[#243628]">
            <span>اختصارات:</span>
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#121B14] rounded-md border border-[#E0D9CB] dark:border-[#243628] font-bold text-[#D99B26] dark:text-[#EBB34D]">Enter</kbd> انتقال
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#121B14] rounded-md border border-[#E0D9CB] dark:border-[#243628] font-bold text-[#D99B26] dark:text-[#EBB34D]">Insert</kbd> سطر جديد
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#121B14] rounded-md border border-[#E0D9CB] dark:border-[#243628] font-bold text-[#D99B26] dark:text-[#EBB34D]">Ctrl+Del</kbd> حذف
          </div>

          <button
            onClick={() => insertRowAt(lines.length - 1)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] hover:bg-[#FDE68A] dark:bg-[#EBB34D]/15 dark:text-[#EBB34D] dark:border-[#EBB34D]/30 dark:hover:bg-[#EBB34D]/25 rounded-xl font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة سطر (Insert)</span>
          </button>

          <button
            onClick={handleSaveVoucher}
            disabled={isSubmitting || !isBalanced}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold shadow-xs transition-all ${
              isBalanced
                ? 'bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white cursor-pointer active:scale-95'
                : 'bg-gray-100 dark:bg-[#1A241C] text-gray-400 dark:text-gray-600 border border-[#E0D9CB] dark:border-[#243628] cursor-not-allowed opacity-60'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'جاري الترحيل...' : 'حفظ وترحيل القيد (F2)'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#F3EFE6] dark:hover:bg-[#1F2E23] rounded-xl font-bold transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          )}
        </div>
      </div>

      {/* 2. Voucher Header Meta Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 px-5 py-3.5 bg-[#F3EFE6]/70 dark:bg-[#121B14]/70 border-b border-[#E0D9CB] dark:border-[#243628] text-xs shrink-0">
        <div>
          <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">رقم السند (Note No):</label>
          <input
            type="number"
            value={noteNo}
            onChange={(e) => setNoteNo(parseInt(e.target.value, 10) || 0)}
            className="w-full bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] rounded-xl px-3 py-2 text-[#D99B26] dark:text-[#EBB34D] font-mono font-black focus:border-[#D99B26] dark:focus:border-[#EBB34D] focus:ring-1 focus:ring-[#D99B26]/30 outline-none transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">تاريخ القيد (Voucher Date):</label>
          <input
            type="date"
            value={noteDate}
            onChange={(e) => setNoteDate(e.target.value)}
            className="w-full bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] rounded-xl px-3 py-2 text-[#1A241C] dark:text-[#F3EFE6] font-mono font-bold focus:border-[#D99B26] dark:focus:border-[#EBB34D] focus:ring-1 focus:ring-[#D99B26]/30 outline-none transition-all shadow-2xs"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">البيان والشرح العام (General Memo):</label>
          <input
            type="text"
            value={generalDescription}
            onChange={(e) => setGeneralDescription(e.target.value)}
            placeholder="أدخل الشرح العام لسند القيد المحاسبي..."
            className="w-full bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] rounded-xl px-3 py-2 text-[#1A241C] dark:text-[#F3EFE6] font-bold focus:border-[#D99B26] dark:focus:border-[#EBB34D] focus:ring-1 focus:ring-[#D99B26]/30 outline-none transition-all shadow-2xs placeholder-[#5C665E]/50 dark:placeholder-[#8FA392]/50"
          />
        </div>
      </div>

      {/* Alerts */}
      {errorBanner && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-700 dark:bg-[#3F2A2A] dark:border-[#5C3E3E] dark:text-[#EFA3A3] text-xs font-bold shrink-0">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {successBanner && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-700 dark:bg-[#2A3F30] dark:border-[#3E5C46] dark:text-[#A3CFAC] text-xs font-bold shrink-0">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* 3. High-Density Keyboard Data Grid Table */}
      <div className="flex-1 overflow-auto bg-white dark:bg-[#0E1610]">
        <table className="w-full border-collapse text-xs text-right">
          <thead className="sticky top-0 bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] border-b border-[#E0D9CB] dark:border-[#243628] z-10 font-black">
            <tr>
              <th className="py-2.5 px-3 w-12 text-center border-l border-[#E0D9CB]/80 dark:border-[#243628]/80">م</th>
              <th className="py-2.5 px-3 w-72 border-l border-[#E0D9CB]/80 dark:border-[#243628]/80">كود واسم الحساب (Level 5 Account)</th>
              <th className="py-2.5 px-3 border-l border-[#E0D9CB]/80 dark:border-[#243628]/80">شرح السطر (Line Memo)</th>
              <th className="py-2.5 px-3 w-56 border-l border-[#E0D9CB]/80 dark:border-[#243628]/80">مركز التكلفة (Cost Center)</th>
              <th className="py-2.5 px-3 w-36 text-center border-l border-[#E0D9CB]/80 dark:border-[#243628]/80 text-[#245E33] dark:text-[#A3CFAC]">مدين (Debit)</th>
              <th className="py-2.5 px-3 w-36 text-center border-l border-[#E0D9CB]/80 dark:border-[#243628]/80 text-[#92400E] dark:text-[#EBB34D]">دائن (Credit)</th>
              <th className="py-2.5 px-2 w-12 text-center">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60 font-mono">
            {lines.map((line, idx) => {
              const isSelectedRow = focusedCell.row === idx;

              return (
                <tr
                  key={line.sr || idx}
                  className={`transition-colors ${
                    isSelectedRow ? 'bg-[#059669]/5 dark:bg-[#059669]/10' : 'hover:bg-[#F3EFE6]/50 dark:hover:bg-[#17231A]/40'
                  }`}
                >
                  {/* Sequence Number */}
                  <td className="py-2 px-2 text-center text-[#5C665E] dark:text-[#8FA392] border-l border-[#E0D9CB]/60 dark:border-[#243628]/60 font-bold select-none">
                    {line.sr}
                  </td>

                  {/* Account Code & Name (Typeahead) */}
                  <td className="p-1.5 border-l border-[#E0D9CB]/60 dark:border-[#243628]/60 relative">
                    <div className="flex items-center gap-1.5">
                      <input
                        ref={(el) => {
                          if (el) inputRefs.current.set(`${idx}_account`, el);
                        }}
                        type="text"
                        value={line.level5Id}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateLine(idx, 'level5Id', val);
                          setTypeaheadQuery({ row: idx, text: val });
                          setTypeaheadIndex(0);
                        }}
                        onFocus={() => {
                          setFocusedCell({ row: idx, col: 'account' });
                          setTypeaheadQuery({ row: idx, text: line.level5Id });
                        }}
                        onKeyDown={(e) => handleKeyDown(e, idx, 'account')}
                        placeholder="كود أو اسم الحساب..."
                        className="w-28 bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] rounded-lg px-2.5 py-1.5 text-[#1A241C] dark:text-[#F3EFE6] font-bold text-left focus:border-[#059669] outline-none shadow-2xs"
                      />
                      <span className="text-xs text-[#1A241C] dark:text-[#F3EFE6] font-sans font-bold truncate max-w-[150px]">
                        {line.level5NameAr || 'اختر الحساب...'}
                      </span>
                    </div>

                    {/* Typeahead Dropdown */}
                    {typeaheadQuery && typeaheadQuery.row === idx && filteredAccounts.length > 0 && (
                      <div className="absolute top-full right-1 left-1 bg-white dark:bg-[#141E16] border border-[#E0D9CB] dark:border-[#243628] rounded-xl shadow-2xl z-50 max-h-48 overflow-auto py-1">
                        {filteredAccounts.map((acc, aIdx) => (
                          <div
                            key={acc.code}
                            onMouseDown={() => selectAccount(idx, acc)}
                            className={`flex items-center justify-between px-3.5 py-2 text-xs cursor-pointer ${
                              typeaheadIndex === aIdx ? 'bg-[#059669] text-white font-bold' : 'hover:bg-[#F3EFE6] dark:hover:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6]'
                            }`}
                          >
                            <span className="font-mono font-bold">{acc.code}</span>
                            <span className="font-sans font-bold">{acc.nameAr}</span>
                            <span className="text-[10px] opacity-75 font-semibold">
                              {acc.accountNature === 0 ? 'مدين' : 'دائن'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Line Memo Description */}
                  <td className="p-1.5 border-l border-[#E0D9CB]/60 dark:border-[#243628]/60">
                    <input
                      ref={(el) => {
                        if (el) inputRefs.current.set(`${idx}_description`, el);
                      }}
                      type="text"
                      value={line.description}
                      onChange={(e) => updateLine(idx, 'description', e.target.value)}
                      onFocus={() => setFocusedCell({ row: idx, col: 'description' })}
                      onKeyDown={(e) => handleKeyDown(e, idx, 'description')}
                      placeholder="شرح السطر..."
                      className="w-full bg-transparent hover:bg-[#F3EFE6]/60 dark:hover:bg-[#17231A]/60 focus:bg-white dark:focus:bg-[#17231A] border border-transparent focus:border-[#E0D9CB] dark:focus:border-[#243628] rounded-lg px-2.5 py-1.5 text-[#1A241C] dark:text-[#F3EFE6] font-sans font-medium outline-none"
                    />
                  </td>

                  {/* Cost Center */}
                  <td className="p-1.5 border-l border-[#E0D9CB]/60 dark:border-[#243628]/60">
                    <select
                      value={line.costcenterId}
                      onChange={(e) => {
                        const val = e.target.value;
                        const match = costCenters.find((c) => c.code === val);
                        updateLine(idx, 'costcenterId', val);
                        if (match) updateLine(idx, 'costcenterNameAr', match.nameAr);
                      }}
                      onFocus={() => setFocusedCell({ row: idx, col: 'costcenter' })}
                      className="w-full bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] rounded-lg px-2.5 py-1.5 text-[#1A241C] dark:text-[#F3EFE6] font-sans font-medium outline-none focus:border-[#059669] cursor-pointer shadow-2xs"
                    >
                      {costCenters.map((cc) => (
                        <option key={cc.code} value={cc.code} className="bg-white dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6]">
                          {cc.code === '0' ? 'عام' : `${cc.code} - ${cc.nameAr}`}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Debit Amount */}
                  <td className="p-1.5 border-l border-[#E0D9CB]/60 dark:border-[#243628]/60">
                    <input
                      ref={(el) => {
                        if (el) inputRefs.current.set(`${idx}_debit`, el);
                      }}
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.debit}
                      onChange={(e) => updateLine(idx, 'debit', e.target.value)}
                      onFocus={() => setFocusedCell({ row: idx, col: 'debit' })}
                      onKeyDown={(e) => handleKeyDown(e, idx, 'debit')}
                      className="w-full bg-[#EAF3EB]/70 dark:bg-[#2A3F30]/30 border border-[#B8D8BC] dark:border-[#3D5A45] focus:border-[#059669] rounded-lg px-2.5 py-1.5 text-[#245E33] dark:text-[#A3CFAC] font-black text-center outline-none tabular-nums shadow-2xs"
                    />
                  </td>

                  {/* Credit Amount */}
                  <td className="p-1.5 border-l border-[#E0D9CB]/60 dark:border-[#243628]/60">
                    <input
                      ref={(el) => {
                        if (el) inputRefs.current.set(`${idx}_credit`, el);
                      }}
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.credit}
                      onChange={(e) => updateLine(idx, 'credit', e.target.value)}
                      onFocus={() => setFocusedCell({ row: idx, col: 'credit' })}
                      onKeyDown={(e) => handleKeyDown(e, idx, 'credit')}
                      className="w-full bg-[#FEF3C7]/70 dark:bg-[#3F2A2A]/30 border border-[#FDE68A] dark:border-[#5A3D3D] focus:border-[#D99B26] rounded-lg px-2.5 py-1.5 text-[#92400E] dark:text-[#EBB34D] font-black text-center outline-none tabular-nums shadow-2xs"
                    />
                  </td>

                  {/* Actions */}
                  <td className="p-1.5 text-center">
                    <button
                      onClick={() => deleteRowAt(idx)}
                      disabled={lines.length <= 2}
                      title="حذف هذا السطر (Ctrl+Del)"
                      className="text-[#5C665E] hover:text-rose-600 dark:text-[#8FA392] dark:hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Dynamic Balancing HUD (Persistent Sticky Footer) */}
      <div className="sticky bottom-0 bg-white dark:bg-[#121B14] border-t border-[#E0D9CB] dark:border-[#243628] px-5 py-3.5 z-20 shadow-xl shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Balancing Metrics HUD */}
          <div className="flex items-center gap-3">
            {/* Total Debit Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#EAF3EB] text-[#245E33] border border-[#B8D8BC] dark:bg-[#2A3F30] dark:text-[#A3CFAC] dark:border-[#3D5A45] rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold">إجمالي المدين:</span>
              <span className="font-mono font-black text-sm tabular-nums">
                {totalDebit.toFixed(2)}
              </span>
              <span className="text-[10px] font-bold">ج.م</span>
            </div>

            {/* Total Credit Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] dark:bg-[#1F2E23] dark:text-[#EBB34D] dark:border-[#243628] rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold">إجمالي الدائن:</span>
              <span className="font-mono font-black text-sm tabular-nums">
                {totalCredit.toFixed(2)}
              </span>
              <span className="text-[10px] font-bold">ج.م</span>
            </div>

            {/* Invariant Difference Badge */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-bold shadow-2xs ${
                isBalanced
                  ? 'bg-[#EAF3EB] text-[#245E33] border border-[#B8D8BC] dark:bg-[#2A3F30] dark:text-[#A3CFAC] dark:border-[#3D5A45]'
                  : 'bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 animate-pulse'
              }`}
            >
              {isBalanced ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#059669] dark:text-[#34D399]" />
                  <span>متوازن تماماً (الفارق: 0.0000)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>غير متوازن (الفارق: {difference.toFixed(4)} ج.م)</span>
                </>
              )}
            </div>

            {/* Auto-Balance Button */}
            {!isBalanced && (
              <button
                onClick={handleAutoBalance}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] hover:bg-[#FDE68A] dark:bg-[#EBB34D]/20 dark:text-[#EBB34D] dark:border-[#EBB34D]/40 rounded-xl transition-all cursor-pointer font-bold text-xs shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
                <span>موازنة تلقائية</span>
              </button>
            )}
          </div>

          {/* Arabic Tafqeet Representation */}
          {tafqeetSentence && (
            <div className="hidden xl:flex items-center gap-2 text-xs bg-[#F3EFE6] dark:bg-[#17231A] px-3.5 py-1.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628]">
              <span className="text-[#5C665E] dark:text-[#8FA392] font-bold">المبلغ تفقيطاً:</span>
              <span className="text-[#D99B26] dark:text-[#EBB34D] font-bold">{tafqeetSentence}</span>
            </div>
          )}

          {/* Quick Line Counter */}
          <div className="text-[#5C665E] dark:text-[#8FA392] text-xs font-medium">
            إجمالي السطور: <span className="text-[#1A241C] dark:text-[#F3EFE6] font-mono font-black">{lines.length}</span> سطر
          </div>
        </div>
      </div>
    </div>
  );
};
