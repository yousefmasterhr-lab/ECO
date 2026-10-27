/**
 * ECO ERP - Social Insurance Full Excel Engine (Import / Export / Templates / Multi-Sheet Analytics)
 * Powered by ExcelJS & file-saver with RTL Arabic support and Brand Amber header styling.
 */
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
  InsuranceOperationRecord,
  InsuredEmployeeRecord,
  InsuranceWageConfig,
  getEmployeeInsuranceStatus,
  calculateEmployeeContributions,
  normalizeDigits,
} from './insuranceStorage';

function styleHeaderRow(row: ExcelJS.Row) {
  row.height = 28;
  row.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0D1F17' }, // Royal Olive Dark
    };
    cell.font = {
      name: 'Cairo',
      size: 11,
      bold: true,
      color: { argb: 'FFF59E0B' }, // Brand Amber
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFD97706' } },
      bottom: { style: 'medium', color: { argb: 'FFD97706' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      right: { style: 'thin', color: { argb: 'FF334155' } },
    };
  });
}

function styleDataRows(sheet: ExcelJS.Worksheet, startRow = 2) {
  for (let i = startRow; i <= sheet.rowCount; i++) {
    const r = sheet.getRow(i);
    r.height = 22;
    r.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { name: 'Cairo', size: 10, color: { argb: 'FF0F172A' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  }
}

function formatExcelDate(val: any): string {
  if (!val) return '';
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().slice(0, 10);
  }
  const str = String(val).trim();
  // Match DD/MM/YYYY or DD-MM-YYYY
  const dmy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  }
  // Match YYYY/MM/DD or YYYY-MM-DD
  const ymd = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (ymd) {
    return `${ymd[1]}-${ymd[2].padStart(2, '0')}-${ymd[3].padStart(2, '0')}`;
  }
  return str;
}

function cellText(val: ExcelJS.CellValue): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    if ('text' in val && val.text) return String(val.text).trim();
    if ('result' in val && val.result !== undefined) return String(val.result).trim();
    if (val instanceof Date) return formatExcelDate(val);
  }
  return String(val).trim();
}

// ── 1. OPERATIONS EXCEL EXPORT / TEMPLATE / IMPORT ──────────────────────────

export async function exportOperationsToExcel(operations: InsuranceOperationRecord[]): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('مركز العمليات التأمينية', {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }],
  });

  ws.columns = [
    { header: 'م', key: 'seq', width: 8 },
    { header: 'كود الطلب', key: 'code', width: 16 },
    { header: 'رقم الوارد', key: 'incNum', width: 18 },
    { header: 'تاريخ الوارد', key: 'incDate', width: 16 },
    { header: 'نوع الطلب', key: 'reqType', width: 20 },
    { header: 'حالة الطلب', key: 'status', width: 16 },
    { header: 'الشركة', key: 'company', width: 28 },
    { header: 'كود الموظف', key: 'empCode', width: 15 },
    { header: 'الاسم', key: 'empName', width: 28 },
    { header: 'الرقم القومي', key: 'natId', width: 20 },
    { header: 'الرقم التأميني', key: 'insNum', width: 18 },
    { header: 'الملاحظات', key: 'notes', width: 32 },
  ];

  styleHeaderRow(ws.getRow(1));

  operations.forEach((op, idx) => {
    ws.addRow({
      seq: op.seq_num || idx + 1,
      code: op.request_code || '',
      incNum: op.incoming_number || '',
      incDate: op.incoming_date || '',
      reqType: op.request_type || '',
      status: op.status || 'انتظار',
      company: op.company_name || '',
      empCode: op.employee_code || '',
      empName: op.employee_name || '',
      natId: op.national_id || '',
      insNum: op.insurance_number || '',
      notes: op.notes || '',
    });
  });

  styleDataRows(ws, 2);

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `سجل_العمليات_التأمينية_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export async function downloadOperationsTemplateExcel(): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('نموذج استيراد العمليات', {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }],
  });

  ws.columns = [
    { header: 'رقم الوارد', key: 'incNum', width: 18 },
    { header: 'تاريخ الوارد', key: 'incDate', width: 16 },
    { header: 'نوع الطلب', key: 'reqType', width: 20 },
    { header: 'حالة الطلب', key: 'status', width: 16 },
    { header: 'الشركة', key: 'company', width: 28 },
    { header: 'كود الموظف', key: 'empCode', width: 16 },
    { header: 'الاسم', key: 'empName', width: 28 },
    { header: 'الرقم القومي', key: 'natId', width: 20 },
    { header: 'الرقم التأميني', key: 'insNum', width: 18 },
    { header: 'الملاحظات', key: 'notes', width: 32 },
  ];

  styleHeaderRow(ws.getRow(1));

  // Add one clean instructional example row
  ws.addRow({
    incNum: '2026/101',
    incDate: new Date().toISOString().slice(0, 10),
    reqType: 'س1',
    status: 'انتظار',
    company: 'اسم الشركة هنا',
    empCode: 'EMP-001',
    empName: 'الاسم الرباعي للموظف',
    natId: '29501011234567',
    insNum: '123456789',
    notes: 'مثال استرشادي - يمكنك مسحه وإضافة صفوفك',
  });

  styleDataRows(ws, 2);

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `نموذج_استيراد_العمليات_التأمينية_فارغ.xlsx`);
}

export async function parseOperationsExcelFile(
  file: File,
  companies: Array<{ id: string; nameAr: string }>,
  employees: InsuredEmployeeRecord[]
): Promise<Partial<InsuranceOperationRecord>[]> {
  const buffer = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);

  const ws = wb.worksheets[0];
  if (!ws || ws.rowCount < 2) return [];

  const headerMap: Record<number, string> = {};
  ws.getRow(1).eachCell((cell, colNumber) => {
    headerMap[colNumber] = cellText(cell.value);
  });

  const results: Partial<InsuranceOperationRecord>[] = [];

  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const rowData: Record<string, string> = {};
    let hasValue = false;

    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const h = headerMap[colNumber] || '';
      const val = cellText(cell.value);
      if (val) hasValue = true;
      rowData[h] = val;
    });

    if (!hasValue) continue;

    const getVal = (...keys: string[]) => {
      for (const k of keys) {
        for (const [hdr, val] of Object.entries(rowData)) {
          if (hdr.includes(k) && val) return val;
        }
      }
      return '';
    };

    const companyName = getVal('الشركة', 'المنشأة', 'شركة');
    const matchedComp = companies.find(
      (c) => c.nameAr.trim() === companyName.trim() || c.nameAr.includes(companyName.trim())
    );

    const empName = getVal('الاسم', 'اسم الموظف', 'المؤمن عليه');
    const rawNum = getVal('الرقم القومي', 'الرقم التأميني / القومي', 'قومي');
    const rawIns = getVal('الرقم التأميني', 'تأميني');
    const empCode = getVal('كود الموظف', 'كود');

    let nationalId = normalizeDigits(rawNum);
    let insuranceNumber = normalizeDigits(rawIns);
    if (nationalId.length === 9 && !insuranceNumber) {
      insuranceNumber = nationalId;
      nationalId = '';
    }

    const matchedEmp = employees.find(
      (e) =>
        (nationalId && normalizeDigits(e.national_id) === nationalId) ||
        (insuranceNumber && normalizeDigits(e.insurance_number) === insuranceNumber) ||
        (empName && e.name.trim() === empName.trim())
    );

    results.push({
      incoming_number: getVal('رقم الوارد', 'الوارد'),
      incoming_date: formatExcelDate(getVal('تاريخ الوارد', 'التاريخ')) || new Date().toISOString().slice(0, 10),
      request_type: getVal('نوع الطلب', 'الطلب', 'الاستمارة') || 'س1',
      status: (getVal('حالة الطلب', 'الحالة') as any) || 'انتظار',
      company_id: matchedComp?.id || matchedEmp?.company_id || '',
      company_name: matchedComp?.nameAr || companyName || matchedEmp?.company_name || '',
      employee_id: matchedEmp?.id || '',
      employee_code: empCode || matchedEmp?.code || '',
      employee_name: empName || matchedEmp?.name || '',
      national_id: nationalId || matchedEmp?.national_id || '',
      insurance_number: insuranceNumber || matchedEmp?.insurance_number || '',
      notes: getVal('الملاحظات', 'ملاحظات'),
    });
  }

  return results;
}

// ── 2. INSURED EMPLOYEES EXCEL EXPORT / TEMPLATE / IMPORT ───────────────────

export async function exportEmployeesToExcel(
  employees: InsuredEmployeeRecord[],
  operations: InsuranceOperationRecord[]
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('السجل التأميني للعاملين', {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }],
  });

  ws.columns = [
    { header: 'كود الموظف', key: 'code', width: 14 },
    { header: 'الاسم الرباعي', key: 'name', width: 28 },
    { header: 'الرقم القومي', key: 'natId', width: 20 },
    { header: 'الرقم التأميني', key: 'insNum', width: 18 },
    { header: 'الشركة', key: 'company', width: 26 },
    { header: 'مكتب التأمينات المختص', key: 'office', width: 22 },
    { header: 'المهنة التأمينية', key: 'occupation', width: 22 },
    { header: 'كود المهنة', key: 'occCode', width: 14 },
    { header: 'المؤهل الدراسي', key: 'qual', width: 20 },
    { header: 'اسم الأم', key: 'mother', width: 20 },
    { header: 'الحالة التأمينية', key: 'status', width: 18 },
    { header: 'رقم وارد س1', key: 's1Num', width: 16 },
    { header: 'تاريخ الالتحاق', key: 'hireDate', width: 16 },
    { header: 'تاريخ بدء الاشتراك', key: 'subDate', width: 16 },
    { header: 'تاريخ التأمين الفعلي', key: 'insDate', width: 16 },
    { header: 'أجر الاشتراك التأميني', key: 'subWage', width: 18 },
    { header: 'الأجر الشامل', key: 'compWage', width: 18 },
    { header: 'تاريخ الاستقالة / س6', key: 'resDate', width: 18 },
    { header: 'سبب انتهاء الخدمة', key: 'resReason', width: 22 },
    { header: 'المحافظة', key: 'gov', width: 16 },
    { header: 'المركز / القسم', key: 'center', width: 16 },
    { header: 'الشارع / المنطقة', key: 'street', width: 24 },
    { header: 'رقم التليفون', key: 'phone', width: 16 },
  ];

  styleHeaderRow(ws.getRow(1));

  employees.forEach((emp) => {
    const computed = getEmployeeInsuranceStatus(emp, operations);
    ws.addRow({
      code: emp.code || '',
      name: emp.name || '',
      natId: emp.national_id || '',
      insNum: emp.insurance_number || '',
      company: emp.company_name || '',
      office: emp.office_name || '',
      occupation: emp.occupation || '',
      occCode: emp.occupation_code || '',
      qual: emp.qualification || '',
      mother: emp.mother_name || '',
      status: computed.label,
      s1Num: computed.s1IncomingNumber || '',
      hireDate: emp.hire_date || '',
      subDate: emp.sub_start_date || '',
      insDate: computed.effectiveInsDate || '',
      subWage: Number(emp.sub_wage || 0),
      compWage: Number(emp.comp_wage || 0),
      resDate: computed.s6ExitDate || '',
      resReason: computed.s6Reason || '',
      gov: emp.gov || '',
      center: emp.center || '',
      street: [emp.building_no, emp.street, emp.village].filter(Boolean).join(' - '),
      phone: emp.phone || '',
    });
  });

  styleDataRows(ws, 2);

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `السجل_التأميني_للعاملين_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export async function downloadEmployeesTemplateExcel(): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('نموذج استيراد الموظفين', {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }],
  });

  ws.columns = [
    { header: 'كود الموظف', key: 'code', width: 14 },
    { header: 'الاسم الرباعي', key: 'name', width: 28 },
    { header: 'الرقم القومي', key: 'natId', width: 20 },
    { header: 'الرقم التأميني', key: 'insNum', width: 18 },
    { header: 'الشركة', key: 'company', width: 26 },
    { header: 'مكتب التأمينات المختص', key: 'office', width: 22 },
    { header: 'المهنة التأمينية', key: 'occupation', width: 22 },
    { header: 'كود المهنة', key: 'occCode', width: 14 },
    { header: 'المؤهل الدراسي', key: 'qual', width: 20 },
    { header: 'اسم الأم', key: 'mother', width: 20 },
    { header: 'تاريخ الالتحاق', key: 'hireDate', width: 16 },
    { header: 'تاريخ بدء الاشتراك', key: 'subDate', width: 16 },
    { header: 'أجر الاشتراك التأميني', key: 'subWage', width: 18 },
    { header: 'الأجر الشامل', key: 'compWage', width: 18 },
    { header: 'رقم وارد س1', key: 's1Num', width: 16 },
    { header: 'المحافظة', key: 'gov', width: 16 },
    { header: 'المركز / القسم', key: 'center', width: 16 },
    { header: 'الشارع', key: 'street', width: 22 },
    { header: 'رقم التليفون', key: 'phone', width: 16 },
  ];

  styleHeaderRow(ws.getRow(1));

  ws.addRow({
    code: 'INS-0001',
    name: 'أحمد محمد علي حسن',
    natId: '29205151234567',
    insNum: '102030405',
    company: 'اسم الشركة',
    office: 'مكتب تأمينات مدينة نصر أول',
    occupation: 'محاسب عام',
    occCode: '241101',
    qual: 'بكالوريوس تجارة',
    mother: 'فاطمة محمود',
    hireDate: '2026-01-01',
    subDate: '2026-01-01',
    subWage: 4500,
    compWage: 7500,
    s1Num: '2026/55',
    gov: 'القاهرة',
    center: 'مدينة نصر',
    street: 'شارع عباس العقاد',
    phone: '01000000000',
  });

  styleDataRows(ws, 2);

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `نموذج_استيراد_السجل_التأميني_فارغ.xlsx`);
}

export async function parseEmployeesExcelFile(
  file: File,
  companies: Array<{ id: string; nameAr: string }>
): Promise<Partial<InsuredEmployeeRecord>[]> {
  const buffer = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);

  const ws = wb.worksheets[0];
  if (!ws || ws.rowCount < 2) return [];

  const headerMap: Record<number, string> = {};
  ws.getRow(1).eachCell((cell, colNumber) => {
    headerMap[colNumber] = cellText(cell.value);
  });

  const results: Partial<InsuredEmployeeRecord>[] = [];

  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const rowData: Record<string, string> = {};
    let hasValue = false;

    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const h = headerMap[colNumber] || '';
      const val = cellText(cell.value);
      if (val) hasValue = true;
      rowData[h] = val;
    });

    if (!hasValue) continue;

    const getVal = (...keys: string[]) => {
      for (const k of keys) {
        for (const [hdr, val] of Object.entries(rowData)) {
          if (hdr.includes(k) && val) return val;
        }
      }
      return '';
    };

    const name = getVal('الاسم', 'اسم الموظف', 'المؤمن عليه');
    if (!name) continue;

    const companyName = getVal('الشركة', 'المنشأة');
    const matchedComp = companies.find(
      (c) => c.nameAr.trim() === companyName.trim() || c.nameAr.includes(companyName.trim())
    );

    results.push({
      code: getVal('كود الموظف', 'الكود'),
      name,
      national_id: normalizeDigits(getVal('الرقم القومي', 'قومي')),
      insurance_number: normalizeDigits(getVal('الرقم التأميني', 'تأميني')),
      company_id: matchedComp?.id || '',
      company_name: matchedComp?.nameAr || companyName || '',
      office_name: getVal('مكتب التأمينات', 'المكتب'),
      occupation: getVal('المهنة', 'المسمى الوظيفي', 'الوظيفة'),
      occupation_code: normalizeDigits(getVal('كود المهنة')),
      qualification: getVal('المؤهل'),
      mother_name: getVal('اسم الأم', 'الأم'),
      hire_date: formatExcelDate(getVal('تاريخ الالتحاق', 'تاريخ التعيين')),
      sub_start_date: formatExcelDate(getVal('تاريخ بدء الاشتراك', 'تاريخ الاشتراك')),
      ins_date: formatExcelDate(getVal('تاريخ التأمين الفعلي', 'تاريخ التأمين')),
      sub_wage: Number(normalizeDigits(getVal('أجر الاشتراك', 'الأجر التأميني')) || 0),
      comp_wage: Number(normalizeDigits(getVal('الأجر الشامل', 'الشامل')) || 0),
      s1_incoming_number: getVal('رقم وارد س1', 'وارد س1'),
      resignation_date: formatExcelDate(getVal('تاريخ الاستقالة', 'تاريخ س6')),
      resignation_reason: getVal('سبب انتهاء الخدمة', 'سبب الاستقالة'),
      gov: getVal('المحافظة'),
      center: getVal('المركز', 'القسم'),
      street: getVal('الشارع', 'العنوان'),
      phone: getVal('التليفون', 'الهاتف', 'الموبايل'),
      status: getVal('الحالة التأمينية', 'الحالة') || 'مؤمن عليه س1',
    });
  }

  return results;
}

// ── 3. WAGES & S2 SHEET EXCEL EXPORT ─────────────────────────────────────────

export async function exportWagesAndS2ToExcel(
  employees: InsuredEmployeeRecord[],
  config: InsuranceWageConfig,
  companyTitle = 'جميع الشركات'
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('وعاء الأجور واستمارة س2', {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }],
  });

  ws.columns = [
    { header: 'م', key: 'seq', width: 7 },
    { header: 'كود الموظف', key: 'code', width: 14 },
    { header: 'اسم المؤمن عليه', key: 'name', width: 28 },
    { header: 'الرقم التأميني', key: 'insNum', width: 18 },
    { header: 'الرقم القومي', key: 'natId', width: 20 },
    { header: 'الشركة', key: 'company', width: 24 },
    { header: 'تاريخ بدء الاشتراك', key: 'subDate', width: 16 },
    { header: 'أجر الاشتراك الفعلي (ج.م)', key: 'subWage', width: 20 },
    { header: 'الأجر الشامل (ج.م)', key: 'compWage', width: 18 },
    { header: `حصة العامل (${config.employeeShareRate}%)`, key: 'empShare', width: 18 },
    { header: `حصة صاحب العمل (${config.employerShareRate}%)`, key: 'compShare', width: 20 },
    { header: 'إجمالي الاشتراك الشهري (29.75%)', key: 'totalDue', width: 24 },
  ];

  styleHeaderRow(ws.getRow(1));

  employees.forEach((emp, i) => {
    const calc = calculateEmployeeContributions(emp.sub_wage, emp.comp_wage, config);
    ws.addRow({
      seq: i + 1,
      code: emp.code || '',
      name: emp.name || '',
      insNum: emp.insurance_number || '',
      natId: emp.national_id || '',
      company: emp.company_name || companyTitle,
      subDate: emp.sub_start_date || emp.hire_date || '',
      subWage: calc.effectiveSubWage,
      compWage: calc.compWage,
      empShare: calc.employeeShare,
      compShare: calc.employerShare,
      totalDue: calc.totalContribution,
    });
  });

  styleDataRows(ws, 2);

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `كشف_الأجور_والاشتراكات_س2_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ── 4. MULTI-SHEET EXECUTIVE ANALYTICS REPORT (`dashboard.js`) ───────────────

export async function exportExecutiveAnalyticsReportToExcel(params: {
  kpis: Array<{ label: string; value: string | number; subtitle: string }>;
  companiesSummary: Array<{
    companyName: string;
    activeCount: number;
    exitedCount: number;
    totalSubWage: number;
    totalMonthlyDue: number;
    operationsCount: number;
  }>;
  operations: InsuranceOperationRecord[];
  employees: InsuredEmployeeRecord[];
}): Promise<void> {
  const wb = new ExcelJS.Workbook();

  // Sheet 1: Executive KPIs
  const wsKpi = wb.addWorksheet('ملخص المؤشرات التنفيذية', {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }],
  });
  wsKpi.columns = [
    { header: 'المؤشر التنفيذي', key: 'label', width: 34 },
    { header: 'القيمة الحالية', key: 'value', width: 24 },
    { header: 'البيان التفصيلي', key: 'subtitle', width: 42 },
  ];
  styleHeaderRow(wsKpi.getRow(1));
  params.kpis.forEach((k) => wsKpi.addRow(k));
  styleDataRows(wsKpi, 2);

  // Sheet 2: Companies Breakdown
  const wsComp = wb.addWorksheet('إحصائيات الشركات', {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }],
  });
  wsComp.columns = [
    { header: 'اسم الشركة / المنشأة', key: 'companyName', width: 32 },
    { header: 'المؤمن عليهم (على رأس العمل)', key: 'activeCount', width: 22 },
    { header: 'المستقيلين (س6)', key: 'exitedCount', width: 18 },
    { header: 'إجمالي أجور الاشتراك (ج.م)', key: 'totalSubWage', width: 24 },
    { header: 'الاشتراك الشهري المستحق (ج.م)', key: 'totalMonthlyDue', width: 24 },
    { header: 'إجمالي العمليات المسجلة', key: 'operationsCount', width: 20 },
  ];
  styleHeaderRow(wsComp.getRow(1));
  params.companiesSummary.forEach((c) => wsComp.addRow(c));
  styleDataRows(wsComp, 2);

  // Sheet 3: Operations Log
  const wsOps = wb.addWorksheet('سجل العمليات التأمينية', {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }],
  });
  wsOps.columns = [
    { header: 'كود الطلب', key: 'request_code', width: 16 },
    { header: 'رقم الوارد', key: 'incoming_number', width: 18 },
    { header: 'تاريخ الوارد', key: 'incoming_date', width: 16 },
    { header: 'نوع الطلب', key: 'request_type', width: 18 },
    { header: 'حالة الطلب', key: 'status', width: 16 },
    { header: 'الشركة', key: 'company_name', width: 26 },
    { header: 'الموظف', key: 'employee_name', width: 26 },
    { header: 'الرقم القومي', key: 'national_id', width: 20 },
  ];
  styleHeaderRow(wsOps.getRow(1));
  params.operations.forEach((op) => wsOps.addRow(op));
  styleDataRows(wsOps, 2);

  // Sheet 4: Insured Employees
  const wsEmp = wb.addWorksheet('السجل التأميني والأجور', {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }],
  });
  wsEmp.columns = [
    { header: 'كود الموظف', key: 'code', width: 15 },
    { header: 'الاسم الرباعي', key: 'name', width: 28 },
    { header: 'الرقم القومي', key: 'national_id', width: 20 },
    { header: 'الرقم التأميني', key: 'insurance_number', width: 18 },
    { header: 'الشركة', key: 'company_name', width: 26 },
    { header: 'المهنة', key: 'occupation', width: 22 },
    { header: 'أجر الاشتراك', key: 'sub_wage', width: 16 },
    { header: 'الأجر الشامل', key: 'comp_wage', width: 16 },
  ];
  styleHeaderRow(wsEmp.getRow(1));
  params.employees.forEach((emp) => wsEmp.addRow(emp));
  styleDataRows(wsEmp, 2);

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `التقرير_التحليلي_التنفيذي_للتأمينات_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
