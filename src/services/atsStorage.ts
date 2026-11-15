// Talent Acquisition (ATS) Storage Service & Cloudflare D1 Sync
import {
  Candidate,
  JobRequisition,
  Interview,
  JobOffer,
  PipelineStageId,
  TarabotApplicationForm,
} from '../components/modules/ats/types';
import { hrStorage } from './hrStorage';
import { Employee, createStandardDocuments, DocumentItem } from '../context/HRContext';
import { insuranceStorage, InsuredEmployeeRecord } from './insuranceStorage';
import {
  parseEgyptianNationalId,
  calculateFullEgyptianPayrollSlip,
  calculateAnnualLeaveEntitlement,
} from '../utils/egyptianLaborAlgorithms';

export interface ATSPortalConfig {
  companyMode: 'selected' | 'manual';
  companyId?: string;
  companyNameAr: string;
  updatedAt?: string;
}

const STORAGE_KEYS = {
  JOBS: 'eco_ats_jobs',
  CANDIDATES: 'eco_ats_candidates',
  INTERVIEWS: 'eco_ats_interviews',
  OFFERS: 'eco_ats_offers',
  PORTAL_CONFIG: 'eco_ats_portal_config',
};

class ATSStorageService {

  private readLocal<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private writeLocal<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('eco-ats-updated'));
    } catch (e) {
      console.warn('[ATSStorage] LocalStorage write failed', e);
    }
  }

  // ==================== PORTAL BRANDING / COMPANY CONFIG ====================
  public getPortalConfigSync(): ATSPortalConfig {
    return this.readLocal<ATSPortalConfig>(STORAGE_KEYS.PORTAL_CONFIG, {
      companyMode: 'selected',
      companyId: '',
      companyNameAr: '',
    });
  }

  public async getPortalConfig(): Promise<ATSPortalConfig> {
    const local = this.getPortalConfigSync();
    try {
      const res = await fetch('/api/ats/portal-config', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const remote = (await res.json()) as ATSPortalConfig;
        if (remote && (remote.companyNameAr || remote.companyMode)) {
          const merged: ATSPortalConfig = {
            companyMode: remote.companyMode === 'manual' ? 'manual' : 'selected',
            companyId: remote.companyId || '',
            companyNameAr: remote.companyNameAr || local.companyNameAr || '',
            updatedAt: remote.updatedAt,
          };
          localStorage.setItem(STORAGE_KEYS.PORTAL_CONFIG, JSON.stringify(merged));
          return merged;
        }
      }
    } catch {
      // offline fallback
    }
    return local;
  }

  public async savePortalConfig(config: ATSPortalConfig): Promise<ATSPortalConfig> {
    const normalized: ATSPortalConfig = {
      companyMode: config.companyMode === 'manual' ? 'manual' : 'selected',
      companyId: config.companyId || '',
      companyNameAr: (config.companyNameAr || '').trim(),
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEYS.PORTAL_CONFIG, JSON.stringify(normalized));
      window.dispatchEvent(
        new CustomEvent('eco-ats-portal-config-updated', { detail: normalized })
      );
    } catch {}

    try {
      await fetch('/api/ats/portal-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized),
      });
    } catch (e) {
      console.warn('[ATSStorage] Remote savePortalConfig failed', e);
    }
    return normalized;
  }

  // ==================== JOBS / REQUISITIONS ====================
  public async getJobs(companyId?: string): Promise<JobRequisition[]> {
    const local = this.readLocal<JobRequisition[]>(STORAGE_KEYS.JOBS, []);
    try {
      const query = companyId && companyId !== 'all' ? `?companyId=${encodeURIComponent(companyId)}` : '';
      const res = await fetch(`/api/ats/jobs${query}`);
      if (res.ok) {
        const remote = await res.json();
        if (Array.isArray(remote)) {
          this.writeLocal(STORAGE_KEYS.JOBS, remote);
          return remote;
        }
      }
    } catch {
      // offline fallback
    }

    if (companyId && companyId !== 'all') {
      return local.filter(j => !j.companyId || j.companyId === companyId);
    }
    return local;
  }

  public async saveJob(job: JobRequisition): Promise<JobRequisition> {
    const all = this.readLocal<JobRequisition[]>(STORAGE_KEYS.JOBS, []);
    const idx = all.findIndex(j => j.id === job.id);
    const updated = { ...job, updatedAt: new Date().toISOString() };

    if (idx >= 0) {
      all[idx] = updated;
    } else {
      all.unshift(updated);
    }
    this.writeLocal(STORAGE_KEYS.JOBS, all);

    try {
      await fetch('/api/ats/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('[ATSStorage] Remote saveJob failed', e);
    }

    return updated;
  }

  public async deleteJob(jobId: string): Promise<void> {
    const all = this.readLocal<JobRequisition[]>(STORAGE_KEYS.JOBS, []);
    const filtered = all.filter(j => j.id !== jobId);
    this.writeLocal(STORAGE_KEYS.JOBS, filtered);

    try {
      await fetch(`/api/ats/jobs/${jobId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[ATSStorage] Remote deleteJob failed', e);
    }
  }

  // ==================== CANDIDATES ====================
  public async getCandidates(companyId?: string, requisitionId?: string): Promise<Candidate[]> {
    const local = this.readLocal<Candidate[]>(STORAGE_KEYS.CANDIDATES, []);
    try {
      const params = new URLSearchParams();
      if (companyId && companyId !== 'all') params.append('companyId', companyId);
      if (requisitionId) params.append('requisitionId', requisitionId);
      const query = params.toString() ? `?${params.toString()}` : '';

      const res = await fetch(`/api/ats/candidates${query}`);
      if (res.ok) {
        const remote = await res.json();
        if (Array.isArray(remote)) {
          this.writeLocal(STORAGE_KEYS.CANDIDATES, remote);
          return remote;
        }
      }
    } catch {
      // offline fallback
    }

    let filtered = local;
    if (companyId && companyId !== 'all') {
      filtered = filtered.filter(c => !c.companyId || c.companyId === companyId);
    }
    if (requisitionId) {
      filtered = filtered.filter(c => c.jobId === requisitionId);
    }
    return filtered;
  }

  public async saveCandidate(cand: Candidate): Promise<Candidate> {
    const all = this.readLocal<Candidate[]>(STORAGE_KEYS.CANDIDATES, []);
    const idx = all.findIndex(c => c.id === cand.id);
    const updated = { ...cand, updatedAt: new Date().toISOString() };

    if (idx >= 0) {
      all[idx] = updated;
    } else {
      all.unshift(updated);
    }
    this.writeLocal(STORAGE_KEYS.CANDIDATES, all);

    try {
      await fetch('/api/ats/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('[ATSStorage] Remote saveCandidate failed', e);
    }

    return updated;
  }

  public async moveCandidateStage(
    candidateId: string,
    targetStage: PipelineStageId,
    noteText?: string,
    userName = 'المسؤول'
  ): Promise<void> {
    const all = this.readLocal<Candidate[]>(STORAGE_KEYS.CANDIDATES, []);
    const cand = all.find(c => c.id === candidateId);
    if (!cand) return;

    cand.stage = targetStage;
    cand.updatedAt = new Date().toISOString();
    cand.activities = cand.activities || [];
    cand.activities.unshift({
      id: `act_${Date.now()}`,
      type: 'stage_change',
      title: `تغيير المرحلة إلى: ${targetStage}`,
      titleEn: `Moved to: ${targetStage}`,
      description: noteText || 'تم تحديث المرحلة عبر لوحة كانبان',
      performedBy: userName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });

    this.writeLocal(STORAGE_KEYS.CANDIDATES, all);

    try {
      await fetch(`/api/ats/candidates/${candidateId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: targetStage,
          noteText,
          performedBy: userName,
        }),
      });
    } catch (e) {
      console.warn('[ATSStorage] Remote moveStage failed', e);
    }
  }

  public async deleteCandidate(candidateId: string): Promise<void> {
    const all = this.readLocal<Candidate[]>(STORAGE_KEYS.CANDIDATES, []);
    const filtered = all.filter(c => c.id !== candidateId);
    this.writeLocal(STORAGE_KEYS.CANDIDATES, filtered);

    try {
      await fetch(`/api/ats/candidates/${candidateId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[ATSStorage] Remote deleteCandidate failed', e);
    }
  }

  // ==================== INTERVIEWS ====================
  public async getInterviews(): Promise<Interview[]> {
    const local = this.readLocal<Interview[]>(STORAGE_KEYS.INTERVIEWS, []);
    try {
      const res = await fetch('/api/ats/interviews');
      if (res.ok) {
        const remote = await res.json();
        if (Array.isArray(remote)) {
          this.writeLocal(STORAGE_KEYS.INTERVIEWS, remote);
          return remote;
        }
      }
    } catch {
      // offline fallback
    }
    return local;
  }

  public async saveInterview(interview: Interview): Promise<Interview> {
    const all = this.readLocal<Interview[]>(STORAGE_KEYS.INTERVIEWS, []);
    const idx = all.findIndex(i => i.id === interview.id);

    if (idx >= 0) {
      all[idx] = interview;
    } else {
      all.unshift(interview);
    }
    this.writeLocal(STORAGE_KEYS.INTERVIEWS, all);

    try {
      await fetch('/api/ats/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interview),
      });
    } catch (e) {
      console.warn('[ATSStorage] Remote saveInterview failed', e);
    }

    return interview;
  }

  // ==================== OFFERS ====================
  public async getOffers(companyId?: string): Promise<JobOffer[]> {
    const local = this.readLocal<JobOffer[]>(STORAGE_KEYS.OFFERS, []);
    try {
      const query = companyId && companyId !== 'all' ? `?companyId=${encodeURIComponent(companyId)}` : '';
      const res = await fetch(`/api/ats/offers${query}`);
      if (res.ok) {
        const remote = await res.json();
        if (Array.isArray(remote)) {
          this.writeLocal(STORAGE_KEYS.OFFERS, remote);
          return remote;
        }
      }
    } catch {
      // offline fallback
    }

    if (companyId && companyId !== 'all') {
      return local.filter(o => !o.companyId || o.companyId === companyId);
    }
    return local;
  }

  public async saveOffer(offer: JobOffer): Promise<JobOffer> {
    const all = this.readLocal<JobOffer[]>(STORAGE_KEYS.OFFERS, []);
    const idx = all.findIndex(o => o.id === offer.id);
    const updated = { ...offer, updatedAt: new Date().toISOString() };

    if (idx >= 0) {
      all[idx] = updated;
    } else {
      all.unshift(updated);
    }
    this.writeLocal(STORAGE_KEYS.OFFERS, all);

    try {
      await fetch('/api/ats/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('[ATSStorage] Remote saveOffer failed', e);
    }

    return updated;
  }

  public async deleteOffer(offerId: string): Promise<void> {
    const all = this.readLocal<JobOffer[]>(STORAGE_KEYS.OFFERS, []);
    const filtered = all.filter(o => o.id !== offerId);
    this.writeLocal(STORAGE_KEYS.OFFERS, filtered);

    try {
      await fetch(`/api/ats/offers/${offerId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[ATSStorage] Remote deleteOffer failed', e);
    }
  }

  // ==================== STATS & TELEMETRY ====================
  public async getStats(companyId?: string): Promise<{
    totalJobs: number;
    totalCandidates: number;
    scheduledInterviews: number;
    totalOffers: number;
    hiredCount: number;
  }> {
    try {
      const query = companyId && companyId !== 'all' ? `?companyId=${encodeURIComponent(companyId)}` : '';
      const res = await fetch(`/api/ats/stats${query}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // offline fallback
    }

    const jobs = await this.getJobs(companyId);
    const cands = await this.getCandidates(companyId);
    const offers = await this.getOffers(companyId);
    const interviews = await this.getInterviews();

    return {
      totalJobs: jobs.length,
      totalCandidates: cands.length,
      scheduledInterviews: interviews.filter(i => i.status === 'scheduled').length,
      totalOffers: offers.length,
      hiredCount: cands.filter(c => c.stage === 'hired').length,
    };
  }

  // ==================== 1-CLICK CORE HR & INSURANCE CONVERSION ====================
  public async syncCandidateToCoreHR(
    offerId: string,
    actorName = 'مسؤول التوظيف'
  ): Promise<{ employeeCode: string; hrEmployee: Employee; insEmployee: InsuredEmployeeRecord }> {
    const offers = this.readLocal<JobOffer[]>(STORAGE_KEYS.OFFERS, []);
    const offer = offers.find(o => o.id === offerId);
    if (!offer) throw new Error('العرض الوظيفي غير موجود');

    const candidates = this.readLocal<Candidate[]>(STORAGE_KEYS.CANDIDATES, []);
    const candidate = candidates.find(c => c.id === offer.candidateId);

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const employeeCode = `ECO-${year}-${randomSuffix}`;
    const nowStr = new Date().toISOString().substring(0, 10);

    // 1. Construct and save HR Employee
    const hrEmp: Employee = {
      id: `emp_${Date.now()}`,
      uid: String(randomSuffix).padStart(4, '0'),
      employeeCode,
      nameAr: offer.candidateName,
      nameEn: candidate?.nameEn || '',
      jobTitleAr: offer.jobTitle,
      jobTitleEn: candidate?.currentTitle || offer.jobTitle,
      departmentAr: offer.department || 'الإدارة الهندسية',
      departmentEn: 'Engineering',
      companyId: offer.companyId || 'comp_01',
      companyNameAr: offer.companyName || 'شركة أركان للإنشاءات الهندسية',
      branchAr: 'المقر الرئيسي',
      projectCostCenterId: '',
      projectCostCenterName: '',
      mobile: offer.candidatePhone || candidate?.phone || '',
      workPhone: '',
      email: offer.candidateEmail || candidate?.email || '',
      nationalId: candidate?.nationalId || `2${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      hireDate: offer.joiningDate || nowStr,
      contractStatus: 'valid',
      status: 'active',
      lifecycleStatus: 'active',
      directManager: offer.reportingTo || 'مدير الإدارة',
      workLocation: candidate?.location || 'القاهرة',
      disbursementMethod: 'bank_transfer',
      bankName: 'البنك الأهلي المصري',
      bankAccount: '',
      hasOvertime: false,
      gender: 'male',
      religion: 'مسلم',
      address: candidate?.location || 'القاهرة',
      salary: {
        basic: offer.compensation.basicSalary || 12000,
        allowances: (offer.compensation.housingAllowance || 0) + (offer.compensation.transportAllowance || 0),
        deductions: 0,
        net: offer.compensation.totalMonthly || 15000,
      },
      emergencyContact: { name: '', relation: '', phone: '' },
      leaveBalance: { annualTotal: 21, annualUsed: 0, sickTotal: 15, sickUsed: 0, monthlyAccrual: 1.75 },
      avatarColor: '#D99B26',
      roleLevel: offer.jobTitle,
      bloodType: 'O+',
      socialInsuranceNo: '',
      workSchedule: {
        startDate: offer.joiningDate || nowStr,
        endDate: '',
        contractDurationYears: 1,
        hireDate: offer.joiningDate || nowStr,
        noticePeriodMonths: 2,
        hoursPerDay: 8,
        daysPerWeek: 5,
        weeklyHours: 40,
        weekendDays: ['الجمعة', 'السبت'],
        annualTotalDays: 21,
        remainingDays: 21,
        monthlyAccrualDays: 1.75,
        isFlexibleHours: false,
        isRemote: false,
        isDriver: false,
        isBoardMember: false,
        isSiteShifts247: false,
        isFixedHours: true,
        hasSocialInsurance: true,
        socialInsuranceType: 'تأمين نمطي',
        hasMedicalInsurance: false,
        medicalInsuranceMonthlyDeduction: 0,
      },
      documents: [],
      assets: [],
      allowancesList: [],
      bonuses: [],
      deductions: [],
      workedHours: {
        actualHours: 0,
        requiredHours: 160,
        completedDays: 0,
        incompleteDays: 0,
        dailyLogs: [],
      },
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleDateString('ar-EG'),
          actionType: 'إنشاء ملف موظف عبر ATS',
          fieldChanged: 'الحالة العامة',
          oldValue: 'مرشح معتمد',
          newValue: 'موظف نشط',
          userName: actorName,
        },
      ],
    };
    await hrStorage.saveEmployee(hrEmp);

    // 2. Construct and save Social Insurance Employee
    const insEmp: Partial<InsuredEmployeeRecord> = {
      id: `ins_emp_${Date.now()}`,
      code: employeeCode,
      name: offer.candidateName,
      national_id: hrEmp.nationalId,
      insurance_number: '',
      company_id: offer.companyId || 'comp_01',
      company_name: offer.companyName || 'شركة أركان للإنشاءات الهندسية',
      office_name: 'مكتب مقاولات القاهرة',
      occupation: offer.jobTitle,
      hire_date: offer.joiningDate || nowStr,
      sub_start_date: offer.joiningDate || nowStr,
      ins_date: offer.joiningDate || nowStr,
      sub_wage: offer.compensation.basicSalary || 12000,
      comp_wage: offer.compensation.totalMonthly || 15000,
      status: 'نشط',
    };
    const savedInsEmp = await insuranceStorage.saveEmployee(insEmp, actorName);

    // 3. Update JobOffer in ATS
    offer.status = 'synced_to_core_hr';
    offer.isSyncedToCoreHR = true;
    offer.coreHREmployeeId = employeeCode;
    offer.updatedAt = nowStr;
    await this.saveOffer(offer);

    // 4. Update Candidate stage
    if (candidate) {
      candidate.stage = 'hired';
      candidate.status = 'hired';
      candidate.activities = candidate.activities || [];
      candidate.activities.unshift({
        id: `act_${Date.now()}`,
        type: 'synced_hr',
        title: 'اعتماد الموظف في HR والتأمينات',
        titleEn: 'Hired & Synced to Core HR & Insurance',
        description: `تم توليد الرقم الوظيفي ${employeeCode} ونقل الملف كاملاً بنجاح`,
        performedBy: actorName,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      });
      await this.saveCandidate(candidate);
    }

    // 5. Broadcast instant Zero-Refresh events across the ERP
    window.dispatchEvent(new CustomEvent('eco-hr-updated', { detail: hrEmp }));
    window.dispatchEvent(new CustomEvent('eco-insurance-updated', { detail: savedInsEmp }));
    window.dispatchEvent(new CustomEvent('eco-ats-updated'));

    return { employeeCode, hrEmployee: hrEmp, insEmployee: savedInsEmp };
  }

  // ==================== TARABOT OFFICIAL JOB APPLICATION ENGINE ====================
  private async _createEmployeeFromTarabotForm(
    form: TarabotApplicationForm,
    options: {
      companyId?: string;
      companyName?: string;
      actorName?: string;
    }
  ): Promise<{ employeeCode: string; hrEmployee: Employee; insEmployee: InsuredEmployeeRecord }> {
    const nidInfo = parseEgyptianNationalId(form.nationalId || '');
    const nowStr = new Date().toISOString().substring(0, 10);
    const hireDate = form.hiringStartDate || form.applicationDate || nowStr;
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const existingCount = hrStorage.getEmployees().length;
    const uid = String(existingCount + 1).padStart(4, '0');
    const employeeCode = `ECO-${year}-${uid}`;

    const totalAgreed = Math.max(0, Number(form.agreedSalary || 0));
    const basicSalary = Math.round(totalAgreed * 0.7);
    const allowancesAmount = Math.max(0, totalAgreed - basicSalary);
    const payrollCalc = calculateFullEgyptianPayrollSlip({
      basicSalary,
      insurableWage: basicSalary,
      housingAllowance: allowancesAmount,
      isInsured: true,
    });
    const leaveEntitlement = calculateAnnualLeaveEntitlement({
      hireDate,
      nationalId: form.nationalId,
    });

    const baseDocs = createStandardDocuments(form.fullName).map((doc): DocumentItem => {
      if (doc.id === 'doc-10' && form.nationalId) {
        return {
          ...doc,
          status: 'valid',
          expiryDate: form.nationalIdExpiryDate || undefined,
          updatedAt: nowStr,
        };
      }
      if (doc.id === 'doc-08' && form.educationHistory?.some((e) => e.degree.trim())) {
        return { ...doc, status: 'valid', updatedAt: nowStr };
      }
      if (
        doc.id === 'doc-07' &&
        (form.militaryStatus === 'أدى الخدمة' ||
          form.militaryStatus === 'إعفاء نهائى' ||
          form.militaryStatus === 'لم يصبه الدور')
      ) {
        return { ...doc, status: 'valid', updatedAt: nowStr };
      }
      if (doc.id === 'doc-04' && form.previouslyInsured && form.socialInsuranceNumber) {
        return { ...doc, status: 'valid', updatedAt: nowStr };
      }
      return doc;
    });

    const companyId = options.companyId && options.companyId !== 'all' ? options.companyId : 'comp_01';
    const companyNameAr =
      form.companyName?.trim() ||
      options.companyName ||
      this.getPortalConfigSync().companyNameAr ||
      'الشركة المسجلة';

    if (form.scannedPaperFormName) {
      baseDocs.unshift({
        id: `doc-tarabot-form-${Date.now()}`,
        type: 'tarabot_application',
        titleAr: `استمارة طلب التوظيف الرسمية — ${companyNameAr} (${form.registrationNumber || 'مؤرشف'})`,
        status: 'valid',
        updatedAt: nowStr,
        fileName: form.scannedPaperFormName,
        fileData: form.scannedPaperFormDataUrl,
      });
    }
    if (form.cvFileName) {
      baseDocs.unshift({
        id: `doc-cv-${Date.now()}`,
        type: 'cv_resume',
        titleAr: 'السيرة الذاتية للموظف (CV)',
        status: 'valid',
        updatedAt: nowStr,
        fileName: form.cvFileName,
        fileData: form.cvFileDataUrl,
      });
    }

    const hrEmp: Employee = {
      id: `emp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      uid,
      employeeCode,
      nameAr: form.fullName,
      nameEn: '',
      jobTitleAr: form.positionAppliedFor || 'موظف',
      jobTitleEn: '',
      departmentAr: form.department || 'الإدارة الهندسية',
      departmentEn: 'Operations',
      companyId,
      companyNameAr,
      branchAr: 'المقر الرئيسي',
      projectCostCenterId: '',
      projectCostCenterName: '',
      mobile: form.mobilePhone || '',
      workPhone: form.landlinePhone || '',
      email: form.email || '',
      nationalId: form.nationalId || `2${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      birthDate: form.birthDate || nidInfo.birthDate || '',
      governorate: form.governorate || nidInfo.governorateName || 'القاهرة',
      workforceCategory: 'عمالة دائمة — الإدارة المركزية',
      insurableWage: payrollCalc.insurance.clampedInsurableWage,
      hireDate,
      contractStatus: 'valid',
      status: 'active',
      lifecycleStatus: 'active',
      directManager: form.deptManagerApprovalName || 'مدير الإدارة',
      workLocation: form.residenceAddress || form.governorate || 'القاهرة',
      disbursementMethod: 'bank_transfer',
      bankName: 'البنك الأهلي المصري (NBE)',
      bankAccount: '',
      hasOvertime: false,
      gender: form.gender || nidInfo.gender || 'male',
      religion: 'مسلم',
      address: form.residenceAddress || 'القاهرة',
      salary: {
        basic: basicSalary,
        allowances: allowancesAmount,
        deductions: payrollCalc.totalStatutoryAndCustomDeductions,
        net: totalAgreed > 0 ? payrollCalc.netSalary : 0,
      },
      emergencyContact: { name: '', relation: '', phone: form.landlinePhone || '' },
      leaveBalance: {
        annualTotal: leaveEntitlement.annualTotal,
        annualUsed: 0,
        sickTotal: 15,
        sickUsed: 0,
        monthlyAccrual: leaveEntitlement.monthlyAccrual,
      },
      avatarColor: '#059669',
      roleLevel: form.positionAppliedFor || 'موظف',
      bloodType: 'O+',
      socialInsuranceNo: form.previouslyInsured ? form.socialInsuranceNumber || '' : '',
      workSchedule: {
        startDate: hireDate,
        endDate: `${Number(hireDate.slice(0, 4)) + 1}-${hireDate.slice(5)}`,
        contractDurationYears: 1,
        hireDate,
        noticePeriodMonths: 2,
        hoursPerDay: 8,
        daysPerWeek: 5,
        weeklyHours: 40,
        weekendDays: ['الجمعة', 'السبت'],
        annualTotalDays: leaveEntitlement.annualTotal,
        remainingDays: leaveEntitlement.annualTotal,
        monthlyAccrualDays: leaveEntitlement.monthlyAccrual,
        isFlexibleHours: false,
        isRemote: false,
        isDriver: false,
        isBoardMember: false,
        isSiteShifts247: false,
        isFixedHours: true,
        hasSocialInsurance: true,
        socialInsuranceType: 'تأمين نمطي (قانون 148 لسنة 2019)',
        hasMedicalInsurance: false,
        medicalInsuranceMonthlyDeduction: 0,
      },
      documents: baseDocs,
      assets: [],
      allowancesList: [],
      bonuses: [],
      deductions: [],
      workedHours: {
        actualHours: 0,
        requiredHours: 160,
        completedDays: 0,
        incompleteDays: 0,
        dailyLogs: [],
      },
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleDateString('ar-EG'),
          actionType: 'تفريغ استمارة توظيف شركة ترابط وتعيين الموظف',
          fieldChanged: 'السجل العام للموظفين',
          oldValue: `طلب رقم ${form.registrationNumber || '-'}`,
          newValue: `${employeeCode} — ${form.positionAppliedFor}`,
          userName: options.actorName || form.digitizedBy || 'إدارة الموارد البشرية',
        },
      ],
    };

    await hrStorage.saveEmployee(hrEmp);

    const insEmp: Partial<InsuredEmployeeRecord> = {
      id: `ins_emp_${Date.now()}_${randomSuffix}`,
      code: employeeCode,
      name: form.fullName,
      national_id: hrEmp.nationalId,
      insurance_number: form.previouslyInsured ? form.socialInsuranceNumber || '' : '',
      company_id: companyId,
      company_name: companyNameAr,
      office_name: 'مكتب تأمينات مقاولات القاهرة',
      occupation: form.positionAppliedFor || 'موظف',
      hire_date: hireDate,
      sub_start_date: hireDate,
      ins_date: hireDate,
      sub_wage: basicSalary,
      comp_wage: totalAgreed,
      gov: hrEmp.governorate,
      phone: form.mobilePhone,
      qualification: form.educationHistory?.[0]?.degree || '',
      status: 'نشط',
    };
    const savedInsEmp = await insuranceStorage.saveEmployee(
      insEmp,
      options.actorName || 'إدارة الموارد البشرية'
    );

    return { employeeCode, hrEmployee: hrEmp, insEmployee: savedInsEmp };
  }

  public async submitTarabotApplication(
    form: TarabotApplicationForm,
    options: {
      mode: 'candidate_only' | 'direct_hire_employee';
      job?: JobRequisition | null;
      companyId?: string;
      companyName?: string;
      utmSource?: string;
      utmCampaign?: string;
      referralName?: string;
      actorName?: string;
    }
  ): Promise<{
    refNumber: string;
    candidate: Candidate;
    employeeCode?: string;
    hrEmployee?: Employee;
  }> {
    const nidInfo = parseEgyptianNationalId(form.nationalId || '');
    const enrichedForm: TarabotApplicationForm = {
      ...form,
      birthDate: form.birthDate || nidInfo.birthDate || '',
      governorate: form.governorate || nidInfo.governorateName || '',
      gender: form.gender || nidInfo.gender,
    };

    const refNumber =
      enrichedForm.registrationNumber?.trim() ||
      `TRB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    enrichedForm.registrationNumber = refNumber;

    const latestExp = enrichedForm.workExperiences?.find((w) => w.employer.trim() || w.jobTitle.trim());
    const latestEdu = enrichedForm.educationHistory?.find((e) => e.degree.trim());
    const eduSummary = latestEdu
      ? `${latestEdu.degree}${latestEdu.major ? ` - ${latestEdu.major}` : ''}${
          latestEdu.graduationYear ? ` (${latestEdu.graduationYear})` : ''
        }`
      : 'مؤهل مدون بالاستمارة';

    const expYearsEst = enrichedForm.workExperiences?.filter((w) => w.employer.trim()).length || 0;
    const isDirectHire = options.mode === 'direct_hire_employee';
    const isInternal = enrichedForm.entryChannel === 'internal_digitization';

    const portalConfig = this.getPortalConfigSync();
    const resolvedCompanyName =
      enrichedForm.companyName?.trim() ||
      options.companyName ||
      options.job?.companyName ||
      portalConfig.companyNameAr ||
      'الشركة المسجلة';
    enrichedForm.companyName = resolvedCompanyName;

    let employeeCode: string | undefined;
    let hrEmployee: Employee | undefined;

    if (isDirectHire) {
      const converted = await this._createEmployeeFromTarabotForm(enrichedForm, {
        companyId: options.companyId || options.job?.companyId || portalConfig.companyId,
        companyName: resolvedCompanyName,
        actorName: options.actorName,
      });
      employeeCode = converted.employeeCode;
      hrEmployee = converted.hrEmployee;
    }

    const cand: Candidate = {
      id: `cand_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: enrichedForm.fullName,
      nameEn: enrichedForm.fullName,
      email: enrichedForm.email || '',
      phone: enrichedForm.mobilePhone,
      nationalId: enrichedForm.nationalId,
      location: enrichedForm.residenceAddress || enrichedForm.governorate || 'القاهرة، مصر',
      currentTitle: latestExp?.jobTitle || enrichedForm.positionAppliedFor,
      currentCompany: latestExp?.employer || 'غير مسجل بالاستمارة',
      experienceYears: expYearsEst,
      education: eduSummary,
      expectedSalary: enrichedForm.agreedSalary || 0,
      currency: options.job?.currency || 'EGP',
      noticePeriodDays: 30,
      source: isInternal ? 'paper_digitization' : ((options.utmSource as any) || 'careers_page'),
      utmSource: options.utmSource || (isInternal ? 'paper_backlog' : 'careers_portal'),
      utmCampaign: options.utmCampaign || 'recruitment_application',
      referralEmployeeName: options.referralName || undefined,
      jobId: options.job?.id || 'general_application',
      jobTitle: options.job?.title || enrichedForm.positionAppliedFor || 'طلب توظيف عام',
      jobDepartment:
        options.job?.department || enrichedForm.department || 'الإدارة العامة',
      companyId: options.companyId || options.job?.companyId || portalConfig.companyId || 'comp_01',
      companyName: resolvedCompanyName,
      stage: isDirectHire ? 'hired' : 'applied',
      status: isDirectHire ? 'hired' : 'active',
      matchScore: isDirectHire ? 95 : 85,
      rating: 4.5,
      tags: [
        `استمارة التوظيف — ${resolvedCompanyName}`,
        isInternal ? 'تفريغ استمارة ورقية / سيرة ذاتية' : 'تقديم عبر رابط التوظيف',
        ...(isDirectHire && employeeCode ? [`معيّن: ${employeeCode}`] : []),
      ],
      resumeName: enrichedForm.cvFileName || enrichedForm.scannedPaperFormName,
      resumeUrl: enrichedForm.cvFileDataUrl || enrichedForm.scannedPaperFormDataUrl,
      parsedResume: {
        summary: `تقدم بطلب توظيف رسمي (${refNumber}) لدى ${resolvedCompanyName} لوظيفة ${enrichedForm.positionAppliedFor}. موقف التجنيد: ${enrichedForm.militaryStatus}. ${
          enrichedForm.previouslyInsured
            ? `سبق تأمينه برقم ${enrichedForm.socialInsuranceNumber || 'مسجل'}`
            : 'غير مؤمن عليه سابقاً'
        }.`,
        extractedSkills: [
          `الإنجليزية: ${enrichedForm.acquiredSkills.englishLanguage}`,
          `الحاسب الآلي: ${enrichedForm.acquiredSkills.computerSkills}`,
          `التعامل مع الآخرين: ${enrichedForm.acquiredSkills.interpersonalSkills}`,
        ],
        matchedSkills: [],
        missingSkills: [],
        education: eduSummary,
        experienceSummary: latestExp
          ? `${latestExp.jobTitle} لدى ${latestExp.employer} (${latestExp.duration})`
          : 'مرفق بالاستمارة',
        yearsOfExperience: expYearsEst,
        languages: ['العربية', `الإنجليزية (${enrichedForm.acquiredSkills.englishLanguage})`],
        certifications: (enrichedForm.trainingCourses || [])
          .map((t) => t.title)
          .filter(Boolean),
      },
      applicationForm: enrichedForm,
      coreHREmployeeCode: employeeCode,
      notes: [
        {
          id: `note_${Date.now()}`,
          authorId: isInternal ? 'hr_digitizer' : 'public_portal',
          authorName: isInternal ? options.actorName || 'مسؤول إدخال الموارد البشرية' : 'بوابة التوظيف الرسمية',
          content: isDirectHire
            ? `تم تفريغ استمارة التوظيف رقم (${refNumber}) لـ ${resolvedCompanyName} واعتماد التعيين الفوري بكود موظف ${employeeCode}.`
            : `تم تسجيل طلب التوظيف الرسمي رقم (${refNumber}) لـ ${resolvedCompanyName}.`,
          createdAt: new Date().toISOString(),
          isPrivate: false,
        },
      ],
      activities: [
        {
          id: `act_${Date.now()}`,
          type: isDirectHire ? 'synced_hr' : 'stage_change',
          title: isDirectHire
            ? `تسجيل الاستمارة والتعيين المباشر (${employeeCode})`
            : `تسجيل استمارة طلب توظيف (${refNumber})`,
          titleEn: isDirectHire ? 'Digitized & Hired to Core HR' : 'Tarabot Application Recorded',
          description: isDirectHire
            ? `تم ترحيل الاستمارة إلى السجل العام للموظفين والتأمينات الاجتماعية`
            : `الوظيفة المتقدم لها: ${enrichedForm.positionAppliedFor}`,
          performedBy: options.actorName || (isInternal ? 'مسؤول الموارد البشرية' : 'المتقدم عبر البوابة'),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        },
      ],
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.saveCandidate(cand);

    window.dispatchEvent(new CustomEvent('eco-ats-updated'));
    if (isDirectHire) {
      window.dispatchEvent(new CustomEvent('eco-hr-updated', { detail: hrEmployee }));
      window.dispatchEvent(new CustomEvent('eco-insurance-updated'));
    }

    return { refNumber, candidate: cand, employeeCode, hrEmployee };
  }

  public async convertCandidateWithApplicationToEmployee(
    candidateId: string,
    updatedForm: TarabotApplicationForm,
    actorName = 'مدير الموارد البشرية'
  ): Promise<{ employeeCode: string; hrEmployee: Employee; insEmployee: InsuredEmployeeRecord }> {
    const all = this.readLocal<Candidate[]>(STORAGE_KEYS.CANDIDATES, []);
    const cand = all.find((c) => c.id === candidateId);
    if (!cand) throw new Error('ملف المرشح غير موجود');

    const result = await this._createEmployeeFromTarabotForm(updatedForm, {
      companyId: cand.companyId,
      companyName: cand.companyName,
      actorName,
    });

    cand.applicationForm = updatedForm;
    cand.stage = 'hired';
    cand.status = 'hired';
    cand.coreHREmployeeCode = result.employeeCode;
    cand.expectedSalary = updatedForm.agreedSalary || cand.expectedSalary;
    cand.updatedAt = new Date().toISOString();
    cand.activities = cand.activities || [];
    cand.activities.unshift({
      id: `act_${Date.now()}`,
      type: 'synced_hr',
      title: `اعتماد الصفحة الثانية وتحويل الموظف (${result.employeeCode})`,
      titleEn: 'Page 2 Approved & Synced to Core HR',
      description: `تم اعتماد التعيين بدءاً من ${updatedForm.hiringStartDate || '-'} براتب ${
        updatedForm.agreedSalary?.toLocaleString() || '-'
      } ج.م وتوليد الكود الوظيفي ${result.employeeCode}`,
      performedBy: actorName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });

    await this.saveCandidate(cand);
    window.dispatchEvent(new CustomEvent('eco-hr-updated', { detail: result.hrEmployee }));
    window.dispatchEvent(new CustomEvent('eco-insurance-updated', { detail: result.insEmployee }));
    window.dispatchEvent(new CustomEvent('eco-ats-updated'));

    return result;
  }
}

export const atsStorage = new ATSStorageService();

