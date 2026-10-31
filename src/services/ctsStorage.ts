// ====================================================================
// ECO ERP - Project Correspondence Management System (CTS / PCMS)
// Client Storage Service & Cloudflare D1 Synchronization Engine
// ====================================================================

import {
  Correspondence,
  Project,
  Entity,
  AuditLogItem,
  CTSSummaryStats,
  DocType
} from '../components/modules/cts/types';
import {
  INITIAL_PROJECTS,
  INITIAL_ENTITIES,
  INITIAL_CORRESPONDENCES,
  INITIAL_AUDIT_LOGS
} from './ctsSeedData';

const STORAGE_KEYS = {
  PROJECTS: 'eco_cts_projects',
  ENTITIES: 'eco_cts_entities',
  CORRESPONDENCES: 'eco_cts_correspondences',
  AUDIT: 'eco_cts_audit_logs',
  COUNTERS: 'eco_cts_system_counters',
};

export interface GenerateSerialParams {
  project_code: string;       // e.g. "1233"
  originator_code: string;    // e.g. "CON"
  recipient_code: string;     // e.g. "CTR"
  doc_type: DocType;          // e.g. "LTR"
  year?: string;              // e.g. "26"
}

class CTSStorageService {
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
      window.dispatchEvent(new CustomEvent('eco-cts-updated'));
    } catch (e) {
      console.warn('[CTSStorage] LocalStorage write failed', e);
    }
  }

  // ==================== PROJECTS ====================
  public async getProjects(): Promise<Project[]> {
    const local = this.readLocal<Project[]>(STORAGE_KEYS.PROJECTS, []);
    if (local.length === 0) {
      this.writeLocal(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    }

    try {
      const res = await fetch('/api/cts/projects');
      if (res.ok) {
        const remote = await res.json();
        if (Array.isArray(remote) && remote.length > 0) {
          this.writeLocal(STORAGE_KEYS.PROJECTS, remote);
          return remote;
        }
      }
    } catch {
      // offline / fallback
    }

    const current = this.readLocal<Project[]>(STORAGE_KEYS.PROJECTS, []);
    return current.length > 0 ? current : INITIAL_PROJECTS;
  }

  public async saveProject(project: Project): Promise<Project> {
    const all = await this.getProjects();
    const idx = all.findIndex(p => p.project_id === project.project_id || p.project_code === project.project_code);
    const updated: Project = {
      ...project,
      updated_at: new Date().toISOString(),
      created_at: project.created_at || new Date().toISOString(),
    };

    if (idx >= 0) {
      all[idx] = updated;
    } else {
      all.unshift(updated);
    }
    this.writeLocal(STORAGE_KEYS.PROJECTS, all);

    try {
      await fetch('/api/cts/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('[CTSStorage] Remote saveProject failed', e);
    }

    return updated;
  }

  public async deleteProject(projectId: string): Promise<void> {
    const all = await this.getProjects();
    const filtered = all.filter(p => p.project_id !== projectId && p.project_code !== projectId);
    this.writeLocal(STORAGE_KEYS.PROJECTS, filtered);

    try {
      await fetch(`/api/cts/projects/${projectId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[CTSStorage] Remote deleteProject failed', e);
    }
  }

  // ==================== ENTITIES ====================
  public async getEntities(): Promise<Entity[]> {
    const local = this.readLocal<Entity[]>(STORAGE_KEYS.ENTITIES, []);
    if (local.length === 0) {
      this.writeLocal(STORAGE_KEYS.ENTITIES, INITIAL_ENTITIES);
    }

    try {
      const res = await fetch('/api/cts/entities');
      if (res.ok) {
        const remote = await res.json();
        if (Array.isArray(remote) && remote.length > 0) {
          this.writeLocal(STORAGE_KEYS.ENTITIES, remote);
          return remote;
        }
      }
    } catch {
      // offline fallback
    }

    const current = this.readLocal<Entity[]>(STORAGE_KEYS.ENTITIES, []);
    return current.length > 0 ? current : INITIAL_ENTITIES;
  }

  public async saveEntity(entity: Entity): Promise<Entity> {
    const all = await this.getEntities();
    const idx = all.findIndex(e => e.id === entity.id || e.code === entity.code);
    const updated: Entity = {
      ...entity,
      updated_at: new Date().toISOString(),
      created_at: entity.created_at || new Date().toISOString(),
    };

    if (idx >= 0) {
      all[idx] = updated;
    } else {
      all.unshift(updated);
    }
    this.writeLocal(STORAGE_KEYS.ENTITIES, all);

    try {
      await fetch('/api/cts/entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('[CTSStorage] Remote saveEntity failed', e);
    }

    return updated;
  }

  public async deleteEntity(entityId: string): Promise<void> {
    const all = await this.getEntities();
    const filtered = all.filter(e => e.id !== entityId);
    this.writeLocal(STORAGE_KEYS.ENTITIES, filtered);

    try {
      await fetch(`/api/cts/entities/${entityId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[CTSStorage] Remote deleteEntity failed', e);
    }
  }

  // ==================== CORRESPONDENCES ====================
  public async getCorrespondences(filters?: {
    projectRef?: string;
    docType?: string;
    classification?: string;
    status?: string;
  }): Promise<Correspondence[]> {
    const local = this.readLocal<Correspondence[]>(STORAGE_KEYS.CORRESPONDENCES, []);
    if (local.length === 0) {
      this.writeLocal(STORAGE_KEYS.CORRESPONDENCES, INITIAL_CORRESPONDENCES);
    }

    try {
      const params = new URLSearchParams();
      if (filters?.projectRef && filters.projectRef !== 'ALL') params.append('projectRef', filters.projectRef);
      if (filters?.docType && filters.docType !== 'ALL') params.append('docType', filters.docType);
      if (filters?.classification && filters.classification !== 'ALL') params.append('classification', filters.classification);
      if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);

      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`/api/cts/correspondences${query}`);
      if (res.ok) {
        const remote = await res.json();
        if (Array.isArray(remote) && remote.length > 0) {
          this.writeLocal(STORAGE_KEYS.CORRESPONDENCES, remote);
          return remote;
        }
      }
    } catch {
      // offline fallback
    }

    let list = this.readLocal<Correspondence[]>(STORAGE_KEYS.CORRESPONDENCES, []);
    if (list.length === 0) list = INITIAL_CORRESPONDENCES;

    if (filters?.projectRef && filters.projectRef !== 'ALL') {
      list = list.filter(c => c.project_ref === filters.projectRef);
    }
    if (filters?.docType && filters.docType !== 'ALL') {
      list = list.filter(c => c.doc_type === filters.docType);
    }
    if (filters?.classification && filters.classification !== 'ALL') {
      list = list.filter(c => c.classification === filters.classification);
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter(c => c.status === filters.status);
    }

    return list;
  }

  public async getCorrespondenceById(docId: string): Promise<Correspondence | null> {
    const all = await this.getCorrespondences();
    return all.find(c => c.doc_id === docId) || null;
  }

  public async saveCorrespondence(
    corr: Correspondence,
    currentUser = { id: 'usr_root', name: 'مسؤول المنظومة' }
  ): Promise<Correspondence> {
    const all = await this.getCorrespondences();
    const idx = all.findIndex(c => c.doc_id === corr.doc_id);
    const isNew = idx < 0;

    const updated: Correspondence = {
      ...corr,
      updated_at: new Date().toISOString(),
      created_at: corr.created_at || new Date().toISOString(),
    };

    if (isNew) {
      all.unshift(updated);
    } else {
      all[idx] = updated;
    }
    this.writeLocal(STORAGE_KEYS.CORRESPONDENCES, all);

    // Audit log
    await this.logAudit({
      correspondence_id: updated.doc_id,
      target_doc: updated.serial_number,
      action_type: isNew
        ? (updated.doc_type === 'Incoming' ? 'INBOUND_REGISTERED' : 'OUTBOUND_DRAFT_CREATED')
        : 'DOC_UPDATED',
      user_id: currentUser.id,
      user_name: currentUser.name,
      timestamp: new Date().toISOString(),
      details: isNew
        ? `تم تسجيل قيد جديد برقم ${updated.serial_number}`
        : `تم تحديث بيانات المعاملة ${updated.serial_number}`,
      new_value: updated.serial_number,
    });

    try {
      await fetch('/api/cts/correspondences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('[CTSStorage] Remote saveCorrespondence failed', e);
    }

    return updated;
  }

  public async deleteCorrespondence(docId: string): Promise<void> {
    const all = await this.getCorrespondences();
    const target = all.find(c => c.doc_id === docId);
    const filtered = all.filter(c => c.doc_id !== docId);
    this.writeLocal(STORAGE_KEYS.CORRESPONDENCES, filtered);

    if (target) {
      await this.logAudit({
        correspondence_id: docId,
        target_doc: target.serial_number,
        action_type: 'DOC_DELETED',
        user_id: 'usr_root',
        user_name: 'مسؤول المنظومة',
        timestamp: new Date().toISOString(),
        details: `تم حذف المعاملة ${target.serial_number}`,
      });
    }

    try {
      await fetch(`/api/cts/correspondences/${docId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[CTSStorage] Remote deleteCorrespondence failed', e);
    }
  }

  // ==================== WORKFLOW APPROVALS ====================
  public async quickApproveOutbound(
    docId: string,
    currentUser = { id: 'usr_pm', name: 'مدير المشروع' }
  ): Promise<Correspondence | null> {
    const all = await this.getCorrespondences();
    const doc = all.find(c => c.doc_id === docId);
    if (!doc) return null;

    const oldSerial = doc.serial_number;

    // If still in draft, generate atomic official number
    let officialSerial = doc.serial_number;
    if (doc.is_draft || doc.serial_number.startsWith('DRAFT-')) {
      const serialRes = await this.reserveAtomicOfficialSerial({
        project_code: doc.project_ref.replace(/^PRJ-/, ''),
        originator_code: doc.originator_code || 'CON',
        recipient_code: doc.recipient_code || 'CTR',
        doc_type: doc.classification || 'LTR',
      });
      officialSerial = serialRes.serial_number;
    }

    doc.serial_number = officialSerial;
    doc.is_draft = false;
    doc.status = 'Approved';
    doc.approved_by_user_id = currentUser.id;
    doc.approved_by_name = currentUser.name;
    doc.approval_date = new Date().toISOString();
    doc.updated_at = new Date().toISOString();

    // If this outbound was a reply to an inbound parent, mark parent as Replied
    if (doc.parent_doc_id) {
      const parent = all.find(p => p.doc_id === doc.parent_doc_id);
      if (parent) {
        parent.status = 'Replied';
        parent.updated_at = new Date().toISOString();
      }
    }

    this.writeLocal(STORAGE_KEYS.CORRESPONDENCES, all);

    await this.logAudit({
      correspondence_id: doc.doc_id,
      target_doc: officialSerial,
      action_type: 'OUTBOUND_APPROVED_ATOMIC',
      user_id: currentUser.id,
      user_name: currentUser.name,
      timestamp: new Date().toISOString(),
      details: `تم الاعتماد النهائي للخطاب الصادر وتوليد الرقم التسلسلي الرسمي ${officialSerial}`,
      previous_value: oldSerial,
      new_value: officialSerial,
    });

    try {
      await fetch('/api/cts/correspondences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
    } catch (e) {
      console.warn('[CTSStorage] Remote quickApprove failed', e);
    }

    return doc;
  }

  public async returnForRevision(
    docId: string,
    remarks: string,
    currentUser = { id: 'usr_pm', name: 'مدير المشروع' }
  ): Promise<Correspondence | null> {
    const all = await this.getCorrespondences();
    const doc = all.find(c => c.doc_id === docId);
    if (!doc) return null;

    doc.status = 'Rejected';
    doc.review_remarks = remarks;
    doc.returned_by_name = currentUser.name;
    doc.returned_at = new Date().toISOString();
    doc.updated_at = new Date().toISOString();

    this.writeLocal(STORAGE_KEYS.CORRESPONDENCES, all);

    await this.logAudit({
      correspondence_id: doc.doc_id,
      target_doc: doc.serial_number,
      action_type: 'RETURNED_FOR_REVISION',
      user_id: currentUser.id,
      user_name: currentUser.name,
      timestamp: new Date().toISOString(),
      details: `إرجاع المعاملة لمسؤول الإعداد لاستيفاء الملاحظات: ${remarks}`,
      new_value: remarks,
    });

    try {
      await fetch('/api/cts/correspondences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
    } catch (e) {
      console.warn('[CTSStorage] Remote returnForRevision failed', e);
    }

    return doc;
  }

  // ==================== AUDIT TRAIL ====================
  public async getAuditLogs(): Promise<AuditLogItem[]> {
    const local = this.readLocal<AuditLogItem[]>(STORAGE_KEYS.AUDIT, []);
    if (local.length === 0) {
      this.writeLocal(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
    }

    try {
      const res = await fetch('/api/cts/audit-logs');
      if (res.ok) {
        const remote = await res.json();
        if (Array.isArray(remote) && remote.length > 0) {
          this.writeLocal(STORAGE_KEYS.AUDIT, remote);
          return remote;
        }
      }
    } catch {
      // offline fallback
    }

    const current = this.readLocal<AuditLogItem[]>(STORAGE_KEYS.AUDIT, []);
    return current.length > 0 ? current : INITIAL_AUDIT_LOGS;
  }

  public async logAudit(log: AuditLogItem): Promise<void> {
    const all = this.readLocal<AuditLogItem[]>(STORAGE_KEYS.AUDIT, []);
    const item: AuditLogItem = {
      ...log,
      id: log.id || `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: log.timestamp || new Date().toISOString(),
    };
    all.unshift(item);
    this.writeLocal(STORAGE_KEYS.AUDIT, all.slice(0, 300));

    try {
      await fetch('/api/cts/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
    } catch (e) {
      console.warn('[CTSStorage] Remote logAudit failed', e);
    }
  }

  // ==================== ATOMIC COUNTERS ====================
  public generateDraftSerial(): string {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `DRAFT-${randomSuffix}`;
  }

  public async reserveAtomicOfficialSerial(params: GenerateSerialParams): Promise<{
    serial_number: string;
    sequence_number: number;
  }> {
    const currentYear = params.year || new Date().getFullYear().toString().slice(-2);
    const counterKey = `${params.project_code}_${params.doc_type}_${currentYear}`;

    try {
      const res = await fetch('/api/cts/counters/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_code: params.project_code,
          doc_type: params.doc_type,
          year: currentYear,
          originator_code: params.originator_code,
          recipient_code: params.recipient_code,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.serial_number) {
          return {
            serial_number: data.serial_number,
            sequence_number: data.sequence_number,
          };
        }
      }
    } catch {
      // fallback to atomic local counter
    }

    // Local atomic counter
    const counters = this.readLocal<Record<string, number>>(STORAGE_KEYS.COUNTERS, {});
    let currentSeq = counters[counterKey];
    if (typeof currentSeq !== 'number') {
      currentSeq = params.project_code === '1233' && params.doc_type === 'LTR' ? 44 : 0;
    }
    const nextSeq = currentSeq + 1;
    counters[counterKey] = nextSeq;
    this.writeLocal(STORAGE_KEYS.COUNTERS, counters);

    const paddedSeq = String(nextSeq).padStart(4, '0');
    const serial_number = `${params.project_code}-${params.originator_code}-${params.recipient_code}-${params.doc_type}-${currentYear}-${paddedSeq}`;

    return {
      serial_number,
      sequence_number: nextSeq,
    };
  }

  // ==================== STATS ====================
  public async getStats(projectRef?: string): Promise<CTSSummaryStats> {
    try {
      const q = projectRef && projectRef !== 'ALL' ? `?projectRef=${encodeURIComponent(projectRef)}` : '';
      const res = await fetch(`/api/cts/stats${q}`);
      if (res.ok) {
        const stats = await res.json();
        return stats;
      }
    } catch {
      // fallback
    }

    const correspondences = await this.getCorrespondences(projectRef ? { projectRef } : undefined);
    const projects = await this.getProjects();

    const inbounds = correspondences.filter(c => c.doc_type === 'Incoming');
    const outbounds = correspondences.filter(c => c.doc_type === 'Outgoing' && !c.is_draft);
    const drafts = correspondences.filter(c => c.is_draft || c.status === 'Draft' || c.status === 'Pending');
    const replied = inbounds.filter(c => c.status === 'Replied');

    const totalCorr = correspondences.length;
    const inboundsCount = inbounds.length;
    const outboundsCount = outbounds.length;
    const draftsCount = drafts.length;
    const repliedCount = replied.length;
    const approvedCount = correspondences.filter(c => c.status === 'Approved').length;
    const overdueCount = correspondences.filter(c => c.status === 'Pending' && c.due_date && new Date(c.due_date) < new Date()).length;

    return {
      totalLetters: totalCorr,
      inboundCount: inboundsCount,
      outboundCount: outboundsCount,
      draftsCount: draftsCount,
      replyRate: inboundsCount > 0 ? Math.round((repliedCount / inboundsCount) * 100) : 100,
      activeProjectsCount: projects.filter(p => p.project_status === 'Active').length,
      total_correspondences: totalCorr,
      total_inbound: inboundsCount,
      total_outbound: outboundsCount,
      total_drafts: draftsCount,
      total_pending_approval: drafts.filter(d => d.status === 'Pending').length,
      total_approved: approvedCount,
      total_replied: repliedCount,
      total_overdue: overdueCount,
      average_reply_time_days: 2.8,
    };
  }
}

export const ctsStorage = new CTSStorageService();
