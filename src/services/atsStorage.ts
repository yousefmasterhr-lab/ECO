// Talent Acquisition (ATS) Storage Service & Cloudflare D1 Sync
import { Candidate, JobRequisition, Interview, JobOffer, PipelineStageId } from '../components/modules/ats/types';
import { hrStorage } from './hrStorage';
import { Employee } from '../context/HRContext';
import { insuranceStorage, InsuredEmployeeRecord } from './insuranceStorage';

const STORAGE_KEYS = {
  JOBS: 'eco_ats_jobs',
  CANDIDATES: 'eco_ats_candidates',
  INTERVIEWS: 'eco_ats_interviews',
  OFFERS: 'eco_ats_offers',
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
}

export const atsStorage = new ATSStorageService();

