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
    <div className="flex flex-col h-full w-full bg-slate-900 text-stone-100 font-sans select-none rounded-xl border border-amber-500/30 shadow-2xl overflow-hidden" dir="rtl">
      {/* 1. Executive Desktop Command Ribbon */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-gradient-to-l from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/20 text-xs">
        {/* Left Side: System Title & Multi-Database Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 font-bold">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>سند قيد اليومية العامة (General Ledger Voucher)</span>
          </div>

          {/* Database Switcher */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">قاعدة البيانات:</span>
            <select
              value={activeDbKey}
              onChange={(e) => handleDatabaseChange(e.target.value)}
              className="bg-transparent text-cyan-300 font-semibold text-xs border-none outline-none cursor-pointer"
            >
              {databases.map((db) => (
                <option key={db.name} value={db.name} className="bg-slate-900 text-slate-100">
                  {db.displayNameAr} ({db.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Side: Keyboard Shortcuts Badge & Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 px-2 py-0.5 bg-slate-800/50 rounded border border-slate-700/50">
            <span>اختصارات:</span>
            <kbd className="px-1 bg-slate-700 rounded text-amber-300">Enter</kbd> انتقال
            <kbd className="px-1 bg-slate-700 rounded text-amber-300">Insert</kbd> سطر جديد
            <kbd className="px-1 bg-slate-700 rounded text-amber-300">Ctrl+Del</kbd> حذف
          </div>

          <button
            onClick={() => insertRowAt(lines.length - 1)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة سطر (Insert)</span>
          </button>

          <button
            onClick={handleSaveVoucher}
            disabled={isSubmitting || !isBalanced}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold shadow-md transition-all ${
              isBalanced
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 cursor-pointer active:scale-95'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'جاري الترحيل...' : 'حفظ وترحيل القيد (F2)'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-2.5 py-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              إغلاق
            </button>
          )}
        </div>
      </div>

      {/* 2. Voucher Header Meta Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 px-4 py-3 bg-slate-950/60 border-b border-slate-800 text-xs">
        <div>
          <label className="block text-slate-400 mb-1 font-medium">رقم السند (Note No):</label>
          <input
            type="number"
            value={noteNo}
            onChange={(e) => setNoteNo(parseInt(e.target.value, 10) || 0)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-400 font-bold focus:border-amber-400 outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">تاريخ القيد (Voucher Date):</label>
          <input
            type="date"
            value={noteDate}
            onChange={(e) => setNoteDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-medium focus:border-amber-400 outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-slate-400 mb-1 font-medium">البيان والشرح العام (General Memo):</label>
          <input
            type="text"
            value={generalDescription}
            onChange={(e) => setGeneralDescription(e.target.value)}
            placeholder="أدخل الشرح العام لسند القيد المحاسبي..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-medium focus:border-amber-400 outline-none"
          />
        </div>
      </div>

      {/* Alerts */}
      {errorBanner && (
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 border-b border-rose-500/40 text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {successBanner && (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* 3. High-Density Keyboard Data Grid Table */}
      <div className="flex-1 overflow-auto bg-slate-950/80">
        <table className="w-full border-collapse text-xs text-right">
          <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-xs text-slate-300 border-b border-slate-800 z-10 font-bold">
            <tr>
              <th className="py-2.5 px-3 w-12 text-center border-l border-slate-800">م</th>
              <th className="py-2.5 px-3 w-72 border-l border-slate-800">كود واسم الحساب (Level 5 Account)</th>
              <th className="py-2.5 px-3 border-l border-slate-800">شرح السطر (Line Memo)</th>
              <th className="py-2.5 px-3 w-56 border-l border-slate-800">مركز التكلفة (Cost Center)</th>
              <th className="py-2.5 px-3 w-36 text-center border-l border-slate-800 text-cyan-400">مدين (Debit)</th>
              <th className="py-2.5 px-3 w-36 text-center border-l border-slate-800 text-amber-400">دائن (Credit)</th>
              <th className="py-2.5 px-2 w-12 text-center">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {lines.map((line, idx) => {
              const isSelectedRow = focusedCell.row === idx;

              return (
                <tr
                  key={line.sr || idx}
                  className={`transition-colors ${
                    isSelectedRow ? 'bg-amber-500/5' : 'hover:bg-slate-900/40'
                  }`}
                >
                  {/* Sequence Number */}
                  <td className="py-1 px-2 text-center text-slate-500 border-l border-slate-800 select-none">
                    {line.sr}
                  </td>

                  {/* Account Code & Name (Typeahead) */}
                  <td className="p-1 border-l border-slate-800 relative">
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
                        className="w-28 bg-slate-900/90 border border-slate-700 rounded px-2 py-1 text-slate-100 font-semibold focus:border-amber-400 focus:bg-slate-900 outline-none text-left"
                      />
                      <span className="text-[11px] text-slate-300 font-sans truncate max-w-[150px]">
                        {line.level5NameAr || 'اختر الحساب...'}
                      </span>
                    </div>

                    {/* Typeahead Dropdown */}
                    {typeaheadQuery && typeaheadQuery.row === idx && filteredAccounts.length > 0 && (
                      <div className="absolute top-full right-1 left-1 bg-slate-900 border border-amber-500/40 rounded-lg shadow-2xl z-50 max-h-48 overflow-auto py-1">
                        {filteredAccounts.map((acc, aIdx) => (
                          <div
                            key={acc.code}
                            onMouseDown={() => selectAccount(idx, acc)}
                            className={`flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer ${
                              typeaheadIndex === aIdx ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-800 text-slate-200'
                            }`}
                          >
                            <span className="font-mono">{acc.code}</span>
                            <span className="font-sans">{acc.nameAr}</span>
                            <span className="text-[10px] opacity-75">
                              {acc.accountNature === 0 ? 'مدين' : 'دائن'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Line Memo Description */}
                  <td className="p-1 border-l border-slate-800">
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
                      className="w-full bg-slate-900/50 border border-transparent hover:border-slate-700 focus:border-amber-400 focus:bg-slate-900 rounded px-2 py-1 text-slate-200 font-sans outline-none"
                    />
                  </td>

                  {/* Cost Center */}
                  <td className="p-1 border-l border-slate-800">
                    <select
                      value={line.costcenterId}
                      onChange={(e) => {
                        const val = e.target.value;
                        const match = costCenters.find((c) => c.code === val);
                        updateLine(idx, 'costcenterId', val);
                        if (match) updateLine(idx, 'costcenterNameAr', match.nameAr);
                      }}
                      onFocus={() => setFocusedCell({ row: idx, col: 'costcenter' })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 font-sans outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {costCenters.map((cc) => (
                        <option key={cc.code} value={cc.code}>
                          {cc.code === '0' ? 'عام' : `${cc.code} - ${cc.nameAr}`}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Debit Amount */}
                  <td className="p-1 border-l border-slate-800">
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
                      className="w-full bg-slate-900/80 border border-slate-700 focus:border-cyan-400 rounded px-2.5 py-1 text-cyan-300 font-bold text-center outline-none"
                    />
                  </td>

                  {/* Credit Amount */}
                  <td className="p-1 border-l border-slate-800">
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
                      className="w-full bg-slate-900/80 border border-slate-700 focus:border-amber-400 rounded px-2.5 py-1 text-amber-300 font-bold text-center outline-none"
                    />
                  </td>

                  {/* Actions */}
                  <td className="p-1 text-center">
                    <button
                      onClick={() => deleteRowAt(idx)}
                      disabled={lines.length <= 2}
                      title="حذف هذا السطر (Ctrl+Del)"
                      className="text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed p-1 transition-colors"
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
      <div className="sticky bottom-0 bg-slate-950 border-t border-amber-500/30 p-3 z-20 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Balancing Metrics HUD */}
          <div className="flex items-center gap-3">
            {/* Total Debit Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-cyan-500/40 rounded-lg">
              <span className="text-slate-400">إجمالي المدين:</span>
              <span className="text-cyan-400 font-mono font-bold text-sm">
                {totalDebit.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">ج.م</span>
            </div>

            {/* Total Credit Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-amber-500/40 rounded-lg">
              <span className="text-slate-400">إجمالي الدائن:</span>
              <span className="text-amber-400 font-mono font-bold text-sm">
                {totalCredit.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">ج.م</span>
            </div>

            {/* Invariant Difference Badge */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold ${
                isBalanced
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                  : 'bg-rose-500/15 border-rose-500/50 text-rose-400 animate-pulse'
              }`}
            >
              {isBalanced ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>متوازن تماماً (الفارق: 0.0000)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>غير متوازن (الفارق: {difference.toFixed(4)} ج.م)</span>
                </>
              )}
            </div>

            {/* Auto-Balance Button */}
            {!isBalanced && (
              <button
                onClick={handleAutoBalance}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg transition-all cursor-pointer font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>موازنة تلقائية</span>
              </button>
            )}
          </div>

          {/* Arabic Tafqeet Representation */}
          {tafqeetSentence && (
            <div className="hidden xl:flex items-center gap-2 text-slate-300 font-sans text-[11px] bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-500 font-bold">المبلغ تفقيطاً:</span>
              <span className="text-amber-300 italic font-medium">{tafqeetSentence}</span>
            </div>
          )}

          {/* Quick Line Counter */}
          <div className="text-slate-400 text-[11px]">
            إجمالي السطور: <span className="text-slate-200 font-mono font-bold">{lines.length}</span> سطر
          </div>
        </div>
      </div>
    </div>
  );
};
