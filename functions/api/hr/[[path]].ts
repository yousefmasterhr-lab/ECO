import {
  PagesFunction,
  jsonResponse,
  errorResponse,
  handleOptions,
} from '../_utils';
import { ensureHrSchema } from '../_hrDb';

export const onRequestOptions: PagesFunction = async () => {
  return handleOptions();
};

function parsePath(context: any): { resource: string; id: string | null } {
  const { params, request } = context;
  let pathSegments: string[] = [];

  if (params && params.path) {
    if (Array.isArray(params.path)) {
      pathSegments = params.path;
    } else if (typeof params.path === 'string') {
      pathSegments = params.path.split('/').filter(Boolean);
    }
  }

  if (pathSegments.length === 0) {
    const url = new URL(request.url);
    const sub = url.pathname.replace(/^\/api\/hr\/?/, '');
    pathSegments = sub.split('/').filter(Boolean);
  }

  const resource = pathSegments[0] || 'employees';
  const id = pathSegments[1] || null;

  return { resource, id };
}

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const { env, request } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);
    }

    await ensureHrSchema(env.DB);
    const { resource, id } = parsePath(context);
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId');
    const employeeId = url.searchParams.get('employeeId');
    const period = url.searchParams.get('period');

    switch (resource) {
      case 'employees': {
        if (id) {
          const row = await env.DB.prepare('SELECT * FROM hr_employees WHERE id = ? OR code = ?').bind(id, id).first();
          if (!row) return errorResponse(`الموظف غير موجود (${id})`, 404);
          return jsonResponse({ success: true, employee: row });
        }
        let query = 'SELECT * FROM hr_employees';
        const bindings: any[] = [];
        if (companyId && companyId !== 'all') {
          query += ' WHERE company_id = ?';
          bindings.push(companyId);
        }
        query += ' ORDER BY created_at DESC';
        const result = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse(result.results || []);
      }

      case 'contracts': {
        if (id) {
          const row = await env.DB.prepare('SELECT * FROM hr_contracts WHERE id = ?').bind(id).first();
          if (!row) return errorResponse('العقد غير موجود', 404);
          return jsonResponse({ success: true, contract: row });
        }
        let query = 'SELECT * FROM hr_contracts';
        const bindings: any[] = [];
        if (employeeId) {
          query += ' WHERE employee_id = ?';
          bindings.push(employeeId);
        } else if (companyId && companyId !== 'all') {
          query += ' WHERE company_id = ?';
          bindings.push(companyId);
        }
        query += ' ORDER BY created_at DESC';
        const result = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse(result.results || []);
      }

      case 'attendance': {
        let query = 'SELECT * FROM hr_attendance';
        const bindings: any[] = [];
        const conditions: string[] = [];
        if (employeeId) {
          conditions.push('employee_id = ?');
          bindings.push(employeeId);
        }
        if (companyId && companyId !== 'all') {
          conditions.push('company_id = ?');
          bindings.push(companyId);
        }
        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY date DESC LIMIT 200';
        const result = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse(result.results || []);
      }

      case 'leaves': {
        let query = 'SELECT * FROM hr_leaves';
        const bindings: any[] = [];
        const conditions: string[] = [];
        if (employeeId) {
          conditions.push('employee_id = ?');
          bindings.push(employeeId);
        }
        if (companyId && companyId !== 'all') {
          conditions.push('company_id = ?');
          bindings.push(companyId);
        }
        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY start_date DESC';
        const result = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse(result.results || []);
      }

      case 'loans': {
        let query = 'SELECT * FROM hr_loans';
        const bindings: any[] = [];
        const conditions: string[] = [];
        if (employeeId) {
          conditions.push('employee_id = ?');
          bindings.push(employeeId);
        }
        if (companyId && companyId !== 'all') {
          conditions.push('company_id = ?');
          bindings.push(companyId);
        }
        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY created_at DESC';
        const result = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse(result.results || []);
      }

      case 'rewards': {
        let query = 'SELECT * FROM hr_rewards_penalties';
        const bindings: any[] = [];
        const conditions: string[] = [];
        if (employeeId) {
          conditions.push('employee_id = ?');
          bindings.push(employeeId);
        }
        if (companyId && companyId !== 'all') {
          conditions.push('company_id = ?');
          bindings.push(companyId);
        }
        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY created_at DESC';
        const result = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse(result.results || []);
      }

      case 'payroll': {
        let query = 'SELECT * FROM hr_payroll_runs';
        const bindings: any[] = [];
        const conditions: string[] = [];
        if (period) {
          conditions.push('period_month = ?');
          bindings.push(period);
        }
        if (companyId && companyId !== 'all') {
          conditions.push('company_id = ?');
          bindings.push(companyId);
        }
        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY period_month DESC';
        const result = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse(result.results || []);
      }

      default: {
        // Return summary counts
        const [empCount, contractsCount, loansCount, leavesCount] = await Promise.all([
          env.DB.prepare('SELECT count(*) as count FROM hr_employees').first(),
          env.DB.prepare('SELECT count(*) as count FROM hr_contracts').first(),
          env.DB.prepare('SELECT count(*) as count FROM hr_loans WHERE status = "نشطة"').first(),
          env.DB.prepare('SELECT count(*) as count FROM hr_leaves WHERE status = "قيد المراجعة"').first(),
        ]);
        return jsonResponse({
          success: true,
          totalEmployees: (empCount as any)?.count || 0,
          totalContracts: (contractsCount as any)?.count || 0,
          activeLoans: (loansCount as any)?.count || 0,
          pendingLeaves: (leavesCount as any)?.count || 0,
        });
      }
    }
  } catch (err: any) {
    return errorResponse(`خطأ في استعلام الموارد البشرية: ${err.message || String(err)}`, 500);
  }
};

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { request, env } = context;
    if (!env.DB) return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);

    await ensureHrSchema(env.DB);
    const { resource } = parsePath(context);
    const body = await request.json().catch(() => null);

    if (!body) return errorResponse('بيانات الطلب غير صالحة', 400);

    const now = new Date().toISOString();

    switch (resource) {
      case 'employees': {
        const id = body.id || `EMP-${Date.now().toString().slice(-4)}`;
        const code = body.code || body.employeeCode || `TRB-${id.replace('EMP-', '')}`;
        const nameAr = body.nameAr || body.name_ar;
        if (!nameAr) return errorResponse('اسم الموظف بالعربية مطلوب', 400);

        await env.DB.prepare(`
          INSERT INTO hr_employees (
            id, code, name_ar, name_en, national_id, insurance_no, phone, work_phone,
            email, address, blood_type, religion, marital_status, birth_date,
            company_id, branch_id, department_id, job_title, direct_manager_id,
            hire_date, status, bank_name, iban, payment_method,
            emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
            biometric_id, avatar_url, basic_salary, allowances_total, deductions_total, net_salary,
            documents_json, custody_json, allowances_json, work_schedule_json, audit_logs_json,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            code = excluded.code,
            name_ar = excluded.name_ar,
            name_en = excluded.name_en,
            national_id = excluded.national_id,
            insurance_no = excluded.insurance_no,
            phone = excluded.phone,
            work_phone = excluded.work_phone,
            email = excluded.email,
            address = excluded.address,
            blood_type = excluded.blood_type,
            religion = excluded.religion,
            marital_status = excluded.marital_status,
            birth_date = excluded.birth_date,
            company_id = excluded.company_id,
            branch_id = excluded.branch_id,
            department_id = excluded.department_id,
            job_title = excluded.job_title,
            direct_manager_id = excluded.direct_manager_id,
            hire_date = excluded.hire_date,
            status = excluded.status,
            bank_name = excluded.bank_name,
            iban = excluded.iban,
            payment_method = excluded.payment_method,
            emergency_contact_name = excluded.emergency_contact_name,
            emergency_contact_phone = excluded.emergency_contact_phone,
            emergency_contact_relation = excluded.emergency_contact_relation,
            basic_salary = excluded.basic_salary,
            allowances_total = excluded.allowances_total,
            deductions_total = excluded.deductions_total,
            net_salary = excluded.net_salary,
            documents_json = excluded.documents_json,
            custody_json = excluded.custody_json,
            allowances_json = excluded.allowances_json,
            work_schedule_json = excluded.work_schedule_json,
            audit_logs_json = excluded.audit_logs_json,
            updated_at = excluded.updated_at
        `).bind(
          id,
          code,
          nameAr,
          body.nameEn || body.name_en || '',
          body.nationalId || body.national_id || '',
          body.insuranceNo || body.insurance_no || '',
          body.mobile || body.phone || '',
          body.workPhone || body.work_phone || '',
          body.email || '',
          body.address || '',
          body.bloodType || body.blood_type || 'O+',
          body.religion || 'مسلم',
          body.maritalStatus || body.marital_status || 'أعزب',
          body.birthDate || body.birth_date || '',
          body.companyId || body.company_id || 'comp_tarabot',
          body.branchId || body.branch_id || '',
          body.departmentId || body.department_id || body.departmentAr || '',
          body.jobTitleAr || body.job_title || 'موظف',
          body.directManager || body.direct_manager_id || '',
          body.hireDate || body.hire_date || now.slice(0, 10),
          body.status || 'active',
          body.bankName || body.bank_name || '',
          body.bankAccount || body.bankIban || body.iban || '',
          body.disbursementMethod || body.payment_method || 'bank_transfer',
          body.emergencyContact?.name || body.emergency_contact_name || '',
          body.emergencyContact?.phone || body.emergency_contact_phone || '',
          body.emergencyContact?.relation || body.emergency_contact_relation || '',
          body.biometricId || body.biometric_id || code,
          body.avatarUrl || body.avatar_url || '',
          Number(body.salary?.basic ?? body.basic_salary ?? 0),
          Number(body.salary?.allowances ?? body.allowances_total ?? 0),
          Number(body.salary?.deductions ?? body.deductions_total ?? 0),
          Number(body.salary?.net ?? body.net_salary ?? 0),
          typeof body.documents === 'object' ? JSON.stringify(body.documents) : (body.documents_json || '[]'),
          typeof body.assets === 'object' ? JSON.stringify(body.assets) : (body.custody_json || '[]'),
          typeof body.allowancesList === 'object' ? JSON.stringify(body.allowancesList) : (body.allowances_json || '[]'),
          typeof body.workSchedule === 'object' ? JSON.stringify(body.workSchedule) : (body.work_schedule_json || '{}'),
          typeof body.auditLogs === 'object' ? JSON.stringify(body.auditLogs) : (body.audit_logs_json || '[]'),
          now,
          now
        ).run();

        return jsonResponse({ success: true, id, message: 'تم حفظ بيانات الموظف بنجاح' });
      }

      case 'contracts': {
        const id = body.id || `CTR-${Date.now()}`;
        await env.DB.prepare(`
          INSERT INTO hr_contracts (
            id, employee_id, company_id, contract_type, start_date, end_date,
            probation_end_date, basic_salary, variable_salary, housing_allowance,
            transport_allowance, other_allowances, insurance_salary, work_hours_per_day,
            work_days_per_week, annual_leave_entitlement, file_data, file_name, status, notes,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            contract_type = excluded.contract_type,
            start_date = excluded.start_date,
            end_date = excluded.end_date,
            basic_salary = excluded.basic_salary,
            housing_allowance = excluded.housing_allowance,
            transport_allowance = excluded.transport_allowance,
            file_data = excluded.file_data,
            file_name = excluded.file_name,
            status = excluded.status,
            updated_at = excluded.updated_at
        `).bind(
          id,
          body.employeeId || body.employee_id,
          body.companyId || body.company_id || 'comp_tarabot',
          body.contractType || body.contract_type || 'محدد المدة',
          body.startDate || body.start_date || now.slice(0, 10),
          body.endDate || body.end_date || '',
          body.probationEndDate || body.probation_end_date || '',
          Number(body.basicSalary || body.basic_salary || 0),
          Number(body.variableSalary || body.variable_salary || 0),
          Number(body.housingAllowance || body.housing_allowance || 0),
          Number(body.transportAllowance || body.transport_allowance || 0),
          Number(body.otherAllowances || body.other_allowances || 0),
          Number(body.insuranceSalary || body.insurance_salary || 0),
          Number(body.workHoursPerDay || body.work_hours_per_day || 8),
          Number(body.workDaysPerWeek || body.work_days_per_week || 5),
          Number(body.annualLeaveEntitlement || body.annual_leave_entitlement || 21),
          body.fileData || body.file_data || '',
          body.fileName || body.file_name || '',
          body.status || 'valid',
          body.notes || '',
          now,
          now
        ).run();

        return jsonResponse({ success: true, id, message: 'تم حفظ العقد بنجاح' });
      }

      case 'attendance': {
        const id = body.id || `ATT-${Date.now()}`;
        await env.DB.prepare(`
          INSERT INTO hr_attendance (id, employee_id, company_id, date, check_in, check_out, work_hours, late_minutes, overtime_hours, status, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          body.employeeId || body.employee_id,
          body.companyId || body.company_id || '',
          body.date || now.slice(0, 10),
          body.checkIn || body.check_in || '',
          body.checkOut || body.check_out || '',
          Number(body.workHours || body.work_hours || 0),
          Number(body.lateMinutes || body.late_minutes || 0),
          Number(body.overtimeHours || body.overtime_hours || 0),
          body.status || 'حاضر',
          body.notes || ''
        ).run();

        return jsonResponse({ success: true, id, message: 'تم تسجيل الحضور بنجاح' });
      }

      case 'leaves': {
        const id = body.id || `LV-${Date.now()}`;
        await env.DB.prepare(`
          INSERT INTO hr_leaves (id, employee_id, company_id, leave_type, start_date, end_date, days_count, reason, attachment_data, status, approved_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          body.employeeId || body.employee_id,
          body.companyId || body.company_id || '',
          body.leaveType || body.leave_type || 'اعتيادية',
          body.startDate || body.start_date,
          body.endDate || body.end_date,
          Number(body.daysCount || body.days_count || 1),
          body.reason || '',
          body.attachmentData || body.attachment_data || '',
          body.status || 'معتمد',
          body.approvedBy || body.approved_by || ''
        ).run();

        return jsonResponse({ success: true, id, message: 'تم تسجيل طلب الإجازة بنجاح' });
      }

      case 'loans': {
        const id = body.id || `LN-${Date.now()}`;
        await env.DB.prepare(`
          INSERT INTO hr_loans (id, employee_id, company_id, loan_type, total_amount, monthly_installment, paid_amount, remaining_amount, start_month, installments_count, reason, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            paid_amount = excluded.paid_amount,
            remaining_amount = excluded.remaining_amount,
            status = excluded.status
        `).bind(
          id,
          body.employeeId || body.employee_id,
          body.companyId || body.company_id || '',
          body.loanType || body.loan_type || 'سلفة راتب',
          Number(body.totalAmount || body.total_amount || 0),
          Number(body.monthlyInstallment || body.monthly_installment || 0),
          Number(body.paidAmount || body.paid_amount || 0),
          Number(body.remainingAmount || body.remaining_amount || 0),
          body.startMonth || body.start_month || now.slice(0, 7),
          Number(body.installmentsCount || body.installments_count || 1),
          body.reason || '',
          body.status || 'نشطة'
        ).run();

        return jsonResponse({ success: true, id, message: 'تم تسجيل السلفة بنجاح' });
      }

      case 'rewards': {
        const id = body.id || `REW-${Date.now()}`;
        await env.DB.prepare(`
          INSERT INTO hr_rewards_penalties (id, employee_id, company_id, type, category, amount_or_days, calculation_mode, effective_month, reason, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          body.employeeId || body.employee_id,
          body.companyId || body.company_id || '',
          body.type || 'reward',
          body.category || 'عام',
          Number(body.amountOrDays || body.amount_or_days || 0),
          body.calculationMode || body.calculation_mode || 'fixed_amount',
          body.effectiveMonth || body.effective_month || now.slice(0, 7),
          body.reason || '',
          body.createdBy || body.created_by || ''
        ).run();

        return jsonResponse({ success: true, id, message: 'تم تسجيل المكافأة/الجزاء بنجاح' });
      }

      case 'payroll': {
        const id = body.id || `PAY-${body.periodMonth || body.period_month}-${body.companyId || body.company_id}`;
        await env.DB.prepare(`
          INSERT INTO hr_payroll_runs (
            id, period_month, company_id, status, total_basic, total_allowances,
            total_rewards, total_deductions, total_insurance, total_loans, total_net,
            employees_count, items_json, approved_by, approved_at, disbursed_at,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            status = excluded.status,
            total_basic = excluded.total_basic,
            total_allowances = excluded.total_allowances,
            total_rewards = excluded.total_rewards,
            total_deductions = excluded.total_deductions,
            total_insurance = excluded.total_insurance,
            total_loans = excluded.total_loans,
            total_net = excluded.total_net,
            employees_count = excluded.employees_count,
            items_json = excluded.items_json,
            approved_by = excluded.approved_by,
            approved_at = excluded.approved_at,
            disbursed_at = excluded.disbursed_at,
            updated_at = excluded.updated_at
        `).bind(
          id,
          body.periodMonth || body.period_month,
          body.companyId || body.company_id,
          body.status || 'draft',
          Number(body.totalBasic || body.total_basic || 0),
          Number(body.totalAllowances || body.total_allowances || 0),
          Number(body.totalRewards || body.total_rewards || 0),
          Number(body.totalDeductions || body.total_deductions || 0),
          Number(body.totalInsurance || body.total_insurance || 0),
          Number(body.totalLoans || body.total_loans || 0),
          Number(body.totalNet || body.total_net || 0),
          Number(body.employeesCount || body.employees_count || 0),
          typeof body.items === 'object' ? JSON.stringify(body.items) : (body.items_json || '[]'),
          body.approvedBy || body.approved_by || null,
          body.approvedAt || body.approved_at || null,
          body.disbursedAt || body.disbursed_at || null,
          now,
          now
        ).run();

        return jsonResponse({ success: true, id, message: 'تم حفظ مسير الرواتب بنجاح' });
      }

      default:
        return errorResponse(`المسار غير معروف (${resource})`, 404);
    }
  } catch (err: any) {
    return errorResponse(`خطأ في حفظ بيانات الموارد البشرية: ${err.message || String(err)}`, 500);
  }
};

export const onRequestPut: PagesFunction = async (context) => {
  return onRequestPost(context);
};

export const onRequestDelete: PagesFunction = async (context) => {
  try {
    const { env } = context;
    if (!env.DB) return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);

    await ensureHrSchema(env.DB);
    const { resource, id } = parsePath(context);

    if (!id) return errorResponse('معرف السجل مطلوب للحذف', 400);

    const tableMap: Record<string, string> = {
      employees: 'hr_employees',
      contracts: 'hr_contracts',
      attendance: 'hr_attendance',
      leaves: 'hr_leaves',
      loans: 'hr_loans',
      rewards: 'hr_rewards_penalties',
      payroll: 'hr_payroll_runs',
    };

    const tableName = tableMap[resource];
    if (!tableName) return errorResponse(`المسار غير مدعوم (${resource})`, 404);

    await env.DB.prepare(`DELETE FROM ${tableName} WHERE id = ?`).bind(id).run();

    return jsonResponse({ success: true, message: `تم حذف السجل بنجاح (${id})` });
  } catch (err: any) {
    return errorResponse(`خطأ في حذف السجل: ${err.message || String(err)}`, 500);
  }
};
