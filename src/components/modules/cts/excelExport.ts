// ====================================================================
// ECO ERP - Project Correspondence Management System (CTS / PCMS)
// Ultra-Premium Enterprise Excel Export Utility (Styled .xlsx)
// ====================================================================

import { Correspondence } from './types';
import { formatDateTime, getDocTypeLabel } from './formatters';

export async function exportCorrespondencesToExcel(
  data: Correspondence[],
  fileName = 'سجل_المراسلات_الهندسية_ECO_CTS'
): Promise<void> {
  // Dynamically import exceljs for zero startup overhead and code splitting
  const ExcelJSModule = await import('exceljs');
  const ExcelJS = (ExcelJSModule as any).default || ExcelJSModule;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ECO ERP Correspondence Management System';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('سجل المراسلات', {
    views: [{ rtl: true }]
  });

  const nowFormatted = new Date().toLocaleString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  // -------------------------------------------------------------
  // Row 1: Corporate Title Banner (Amber & Gold Brand)
  // -------------------------------------------------------------
  worksheet.mergeCells('A1:R1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'نظام إدارة المراسلات والمشاريع الهندسية (ECO CTS / PCMS) • سجل المراسلات المعتمد';
  titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB45309' } }; // Amber 700
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 45;

  // -------------------------------------------------------------
  // Row 2: Subtitle Metadata
  // -------------------------------------------------------------
  worksheet.mergeCells('A2:R2');
  const subCell = worksheet.getCell('A2');
  subCell.value = `تاريخ التصدير: ${nowFormatted}  |  إجمالي المعاملات: ${data.length} معاملة  |  منظومة ECO ERP`;
  subCell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FFFDE68A' } };
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1C1917' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(2).height = 26;

  // Row 3: Spacing
  worksheet.getRow(3).height = 10;

  // -------------------------------------------------------------
  // Row 4: Column Headers
  // -------------------------------------------------------------
  const headers = [
    '#',
    'الرقم المرجعي / الصادر',
    'الاتجاه',
    'التصنيف الهندسي',
    'رقم المرجع الخارجي',
    'كود المشروع',
    'الموضوع والبيان',
    'الجهة الراسلة',
    'الجهة الموجه إليها',
    'الأولوية',
    'الحالة',
    'تاريخ التحرير',
    'تاريخ الاستلام',
    'تاريخ الاستحقاق',
    'المعاملة الأصلية',
    'محرر المعاملة',
    'المعتمد',
    'تاريخ الاعتماد'
  ];

  const headerRow = worksheet.getRow(4);
  headerRow.values = headers;
  headerRow.height = 34;

  // Set Widths
  worksheet.columns = [
    { key: 'index', width: 6 },
    { key: 'serial', width: 28 },
    { key: 'type', width: 12 },
    { key: 'class', width: 14 },
    { key: 'ext_ref', width: 24 },
    { key: 'project', width: 16 },
    { key: 'subject', width: 48 },
    { key: 'sender', width: 26 },
    { key: 'receiver', width: 26 },
    { key: 'priority', width: 14 },
    { key: 'status', width: 16 },
    { key: 'issue_date', width: 15 },
    { key: 'received_date', width: 15 },
    { key: 'due_date', width: 15 },
    { key: 'parent_serial', width: 24 },
    { key: 'creator', width: 22 },
    { key: 'approved_by', width: 22 },
    { key: 'approval_date', width: 20 }
  ];

  headerRow.eachCell((cell: any) => {
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFF59E0B' } },
      bottom: { style: 'medium', color: { argb: 'FF92400E' } },
      left: { style: 'thin', color: { argb: 'FFF59E0B' } },
      right: { style: 'thin', color: { argb: 'FFF59E0B' } }
    };
  });

  // -------------------------------------------------------------
  // Data Rows
  // -------------------------------------------------------------
  data.forEach((item, idx) => {
    const isEven = idx % 2 === 0;

    const row = worksheet.addRow([
      idx + 1,
      item.serial_number,
      item.doc_type === 'Incoming' ? 'وارد' : 'صادر',
      getDocTypeLabel(item.classification),
      item.external_ref_no || '—',
      item.project_name ? `${item.project_ref} (${item.project_name})` : item.project_ref,
      item.subject,
      item.sender_entity,
      item.receiver_entity,
      item.priority === 'Urgent' ? 'عاجل' : item.priority === 'Critical' || item.priority === 'Immediate' ? 'حرج جداً' : 'عادي',
      item.status === 'Approved' ? 'معتمد' : item.status === 'Replied' ? 'تم الرد' : item.status === 'Draft' ? 'مسودة' : 'قيد المتابعة',
      item.issue_date || '—',
      item.received_date || '—',
      item.due_date || '—',
      item.parent_serial || (item.parent_doc_id ? 'مرتبط' : '—'),
      item.created_by_name || '—',
      item.approved_by_name || '—',
      item.approval_date ? formatDateTime(item.approval_date) : '—'
    ]);

    row.height = 28;

    row.eachCell((cell: any, colNumber: number) => {
      cell.font = { name: 'Segoe UI', size: 9, color: { argb: 'FF1F2937' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFFDF8F3' }
      };

      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };

      if (colNumber === 2) {
        cell.font = { name: 'Consolas', size: 9, bold: true, color: { argb: 'FFB45309' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colNumber === 7) {
        cell.alignment = { vertical: 'middle', horizontal: 'right', wrapText: false };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });
  });

  // Save to browser
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
