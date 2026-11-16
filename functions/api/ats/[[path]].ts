// Cloudflare Pages Functions - Talent Acquisition (ATS) Endpoints
import {
  PagesFunction,
  jsonResponse,
  errorResponse,
  handleOptions,
} from '../_utils';
import { ensureATSSchema } from '../_atsDb';

export const onRequestOptions: PagesFunction = async () => {
  return handleOptions();
};

const ATTACHMENT_CHUNK_SIZE = 400_000;

function parseJsonSafe<T>(raw: any, fallback: T): T {
  if (!raw || typeof raw !== 'string') return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function inferMimeType(fileName?: string, rawMime?: string): string {
  const cleaned = (rawMime || '').trim().toLowerCase();
  if (cleaned && cleaned !== 'application/octet-stream') {
    return cleaned;
  }
  const lower = (fileName || '').toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.doc')) return 'application/msword';
  if (lower.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  return 'application/pdf';
}

async function saveAttachmentChunks(
  db: any,
  candidateId: string,
  fileType: string,
  fileName: string,
  dataUrl: string
): Promise<string> {
  const match = dataUrl.match(/^data:([^;,]+)?(?:;[^,]*)?,/i);
  const mimeType = inferMimeType(fileName, match?.[1]);
  const totalChunks = Math.max(1, Math.ceil(dataUrl.length / ATTACHMENT_CHUNK_SIZE));

  await db
    .prepare('DELETE FROM ats_attachments WHERE candidate_id = ? AND file_type = ?')
    .bind(candidateId, fileType)
    .run();

  const stmts = [];
  for (let i = 0; i < totalChunks; i++) {
    const chunk = dataUrl.slice(i * ATTACHMENT_CHUNK_SIZE, (i + 1) * ATTACHMENT_CHUNK_SIZE);
    stmts.push(
      db
        .prepare(`
          INSERT INTO ats_attachments (
            id, candidate_id, file_type, file_name, mime_type, chunk_index, total_chunks, data_chunk
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          `att_${candidateId}_${fileType}_${i}`,
          candidateId,
          fileType,
          fileName || `${fileType}.bin`,
          mimeType,
          i,
          totalChunks,
          chunk
        )
    );
  }
  if (stmts.length > 0) {
    await db.batch(stmts);
  }

  return `/api/ats/attachments/${encodeURIComponent(candidateId)}/${encodeURIComponent(fileType)}`;
}

async function loadAttachmentDataUrl(
  db: any,
  candidateId: string,
  fileType: string
): Promise<{ fileName: string; mimeType: string; dataUrl: string } | null> {
  const { results } = await db
    .prepare(
      'SELECT file_name, mime_type, chunk_index, data_chunk FROM ats_attachments WHERE candidate_id = ? AND file_type = ? ORDER BY chunk_index ASC'
    )
    .bind(candidateId, fileType)
    .all();

  if (!results || results.length === 0) return null;
  const first = results[0] as any;
  const dataUrl = results.map((r: any) => String(r.data_chunk || '')).join('');
  return {
    fileName: first.file_name || 'attachment',
    mimeType: first.mime_type || 'application/octet-stream',
    dataUrl,
  };
}

function mapJobRow(j: any) {
  const payload = parseJsonSafe<Record<string, any>>(j.payload_json, {});
  return {
    ...payload,
    id: j.id,
    code: j.code || payload.code || '',
    title: j.title || payload.title || '',
    titleEn: j.title_en || payload.titleEn || '',
    companyId: j.company_id || payload.companyId || 'comp_01',
    companyName: j.company_name || payload.companyName || '',
    department: j.department || payload.department || '',
    location: j.location || payload.location || '',
    employmentType: j.employment_type || payload.employmentType || 'full_time',
    experienceYearsMin: payload.experienceYearsMin ?? 2,
    experienceYearsMax: payload.experienceYearsMax ?? 7,
    budgetMin: Number(j.min_salary ?? payload.budgetMin ?? 0),
    budgetMax: Number(j.max_salary ?? payload.budgetMax ?? 0),
    currency: j.currency || payload.currency || 'EGP',
    targetHireDate: j.target_hire_date || payload.targetHireDate || '',
    headcount: Number(j.headcount ?? payload.headcount ?? 1),
    filledCount: Number(j.filled_count ?? payload.filledCount ?? 0),
    status: j.status || payload.status || 'published',
    description: j.description || payload.description || '',
    skills: payload.skills || [],
    requirements: parseJsonSafe(j.requirements_json, payload.requirements || []),
    responsibilities: parseJsonSafe(j.responsibilities_json, payload.responsibilities || []),
    approvalChain: parseJsonSafe(j.approval_chain_json, payload.approvalChain || []),
    publishedAt: j.published_at || payload.publishedAt || '',
    createdAt: payload.createdAt || j.created_at || '',
    updatedAt: j.updated_at || payload.updatedAt || '',
  };
}

function mapCandidateRow(c: any) {
  const payload = parseJsonSafe<Record<string, any>>(c.payload_json, {});
  const sourceDetailsPayload =
    typeof c.source_details === 'string' && c.source_details.trim().startsWith('{')
      ? parseJsonSafe<Record<string, any>>(c.source_details, {})
      : {};
  const base = { ...sourceDetailsPayload, ...payload };

  const mappedNotes = parseJsonSafe<any[]>(c.notes_json, base.notes || []);
  const mappedActivities = parseJsonSafe<any[]>(c.activities_json, base.activities || []);

  return {
    ...base,
    id: c.id,
    name: c.name || base.name || '',
    nameEn: c.name_en || base.nameEn || '',
    email: c.email || base.email || '',
    phone: c.phone || base.phone || '',
    nationalId: c.national_id || base.nationalId || '',
    location: c.location || base.location || '',
    currentCompany: c.current_company || base.currentCompany || '',
    currentTitle: c.current_title || base.currentTitle || c.headline || '',
    experienceYears: Number(c.total_years_experience ?? base.experienceYears ?? 0),
    education: c.education || base.education || '',
    stage: c.stage || base.stage || 'applied',
    status: c.status || base.status || (c.stage === 'rejected' ? 'rejected' : c.stage === 'hired' ? 'hired' : 'active'),
    matchScore: Number(c.match_score ?? base.matchScore ?? 0),
    rating: Number(base.rating ?? 4.5),
    jobId: c.requisition_id || base.jobId || 'general_application',
    jobTitle: base.jobTitle || c.headline || c.current_title || 'طلب توظيف عام',
    jobDepartment: base.jobDepartment || 'الإدارة العامة',
    companyId: c.company_id || base.companyId || 'comp_01',
    companyName: base.companyName || base.applicationForm?.companyName || '',
    tags: parseJsonSafe(c.tags_json, base.tags || []),
    skills: parseJsonSafe(c.skills_json, base.skills || []),
    resumeUrl: c.resume_url || base.resumeUrl || base.applicationForm?.cvFileDataUrl || '',
    resumeName: c.resume_name || base.resumeName || base.applicationForm?.cvFileName || '',
    appliedAt: c.applied_at || base.appliedAt || c.created_at || '',
    source: c.source || base.source || 'careers_page',
    utmSource: base.utmSource || 'careers_portal',
    utmCampaign: base.utmCampaign || '',
    rejectionReason: c.rejection_reason || base.rejectionReason || '',
    expectedSalary: Number(c.expected_salary ?? base.expectedSalary ?? 0),
    currentSalary: Number(c.current_salary ?? base.currentSalary ?? 0),
    noticePeriodDays: Number(c.notice_period_days ?? base.noticePeriodDays ?? 30),
    currency: base.currency || 'EGP',
    notes: mappedNotes,
    activities: mappedActivities,
    updatedAt: c.updated_at || base.updatedAt || '',
  };
}

function mapOfferRow(o: any) {
  const payload = parseJsonSafe<Record<string, any>>(o.payload_json, {});
  return {
    ...payload,
    id: o.id,
    candidateId: o.candidate_id || payload.candidateId || '',
    candidateName: o.candidate_name || payload.candidateName || '',
    candidateEmail: o.candidate_email || payload.candidateEmail || '',
    candidatePhone: o.candidate_phone || payload.candidatePhone || '',
    jobId: o.requisition_id || payload.jobId || '',
    jobTitle: o.job_title || payload.jobTitle || '',
    department: o.department || payload.department || '',
    companyId: o.company_id || payload.companyId || 'comp_01',
    companyName: o.company_name || payload.companyName || '',
    joiningDate: o.start_date || payload.joiningDate || '',
    expiryDate: o.expires_at || payload.expiryDate || '',
    compensation: parseJsonSafe(o.compensation_json, payload.compensation || null),
    preboardingDocuments: parseJsonSafe(o.preboarding_documents_json, payload.preboardingDocuments || []),
    candidateSignature: parseJsonSafe(o.candidate_signature_json, payload.candidateSignature || null),
    status: o.status || payload.status || 'draft',
    isSyncedToCoreHR: Boolean(o.is_synced_to_core_hr || payload.isSyncedToCoreHR),
    coreHREmployeeId: o.core_hr_employee_id || payload.coreHREmployeeId || '',
    notes: o.notes || payload.notes || '',
    createdAt: payload.createdAt || o.created_at || '',
    updatedAt: o.updated_at || payload.updatedAt || '',
  };
}

function parsePath(context: any): { resource: string; id: string | null; subAction: string | null } {
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
    const sub = url.pathname.replace(/^\/api\/ats\/?/, '');
    pathSegments = sub.split('/').filter(Boolean);
  }

  const resource = pathSegments[0] || 'stats';
  const id = pathSegments[1] || null;
  const subAction = pathSegments[2] || null;

  return { resource, id, subAction };
}

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const { env, request } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);
    }

    await ensureATSSchema(env.DB);
    const { resource, id, subAction } = parsePath(context);
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId');
    const requisitionId = url.searchParams.get('requisitionId');
    const stage = url.searchParams.get('stage');

    switch (resource) {
      case 'attachments': {
        if (!id || !subAction) {
          return errorResponse('معرف المرشح ونوع المرفق مطلوبان', 400);
        }
        const candId = decodeURIComponent(id);
        const fileType = decodeURIComponent(subAction);
        const att = await loadAttachmentDataUrl(env.DB, candId, fileType);
        if (!att || !att.dataUrl) {
          return errorResponse('الملف المرفق غير موجود', 404);
        }
        if (url.searchParams.get('format') === 'json') {
          return jsonResponse(att);
        }

        const commaIdx = att.dataUrl.indexOf(',');
        const base64Data = commaIdx >= 0 ? att.dataUrl.slice(commaIdx + 1) : att.dataUrl;
        const binaryStr = atob(base64Data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const isDownload = url.searchParams.get('download') === '1';
        const resolvedMime = inferMimeType(att.fileName, att.mimeType);
        const headers: Record<string, string> = {
          'Content-Type': resolvedMime,
          'Cache-Control': 'public, max-age=3600',
        };
        if (isDownload) {
          headers['Content-Disposition'] = `attachment; filename*=UTF-8''${encodeURIComponent(att.fileName)}`;
        } else {
          headers['Content-Disposition'] = 'inline';
        }
        return new Response(bytes, {
          status: 200,
          headers,
        });
      }

      case 'stats': {
        let compFilterJobs = '';
        let compFilterCands = '';
        const params: any[] = [];
        if (companyId && companyId !== 'all') {
          compFilterJobs = ' WHERE company_id = ?';
          compFilterCands = ' WHERE company_id = ?';
          params.push(companyId);
        }

        const jobsCount = await env.DB.prepare(
          `SELECT COUNT(*) as count FROM ats_jobs${compFilterJobs}`
        ).bind(...params).first<{ count: number }>();

        const candsCount = await env.DB.prepare(
          `SELECT COUNT(*) as count FROM ats_candidates${compFilterCands}`
        ).bind(...params).first<{ count: number }>();

        const interviewsCount = await env.DB.prepare(
          `SELECT COUNT(*) as count FROM ats_interviews WHERE status = 'scheduled'`
        ).first<{ count: number }>();

        const offersCount = await env.DB.prepare(
          `SELECT COUNT(*) as count FROM ats_offers`
        ).first<{ count: number }>();

        const hiredCount = await env.DB.prepare(
          `SELECT COUNT(*) as count FROM ats_candidates WHERE stage = 'hired'${compFilterCands ? ' AND company_id = ?' : ''}`
        ).bind(...(compFilterCands ? [companyId] : [])).first<{ count: number }>();

        return jsonResponse({
          totalJobs: jobsCount?.count || 0,
          totalCandidates: candsCount?.count || 0,
          scheduledInterviews: interviewsCount?.count || 0,
          totalOffers: offersCount?.count || 0,
          hiredCount: hiredCount?.count || 0,
        });
      }

      case 'jobs':
      case 'requisitions': {
        let query = 'SELECT * FROM ats_jobs';
        const bindings: any[] = [];
        if (id) {
          query += ' WHERE id = ?';
          bindings.push(id);
          const job = await env.DB.prepare(query).bind(...bindings).first();
          if (!job) return errorResponse('الوظيفة غير موجودة', 404);
          return jsonResponse(mapJobRow(job));
        }

        if (companyId && companyId !== 'all') {
          query += ' WHERE company_id = ?';
          bindings.push(companyId);
        }
        query += ' ORDER BY created_at DESC';

        const { results } = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse((results || []).map(mapJobRow));
      }

      case 'candidates': {
        let query = 'SELECT * FROM ats_candidates';
        const bindings: any[] = [];
        const conditions: string[] = [];

        if (id) {
          const cand = await env.DB.prepare('SELECT * FROM ats_candidates WHERE id = ?').bind(id).first();
          if (!cand) return errorResponse('المرشح غير موجود', 404);
          return jsonResponse(mapCandidateRow(cand));
        }

        if (companyId && companyId !== 'all') {
          conditions.push('company_id = ?');
          bindings.push(companyId);
        }
        if (requisitionId) {
          conditions.push('requisition_id = ?');
          bindings.push(requisitionId);
        }
        if (stage) {
          conditions.push('stage = ?');
          bindings.push(stage);
        }

        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY created_at DESC';

        const { results } = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse((results || []).map(mapCandidateRow));
      }

      case 'interviews': {
        let query = 'SELECT * FROM ats_interviews';
        const bindings: any[] = [];
        if (id) {
          query += ' WHERE id = ?';
          bindings.push(id);
          const item = await env.DB.prepare(query).bind(...bindings).first();
          if (!item) return errorResponse('المقابلة غير موجودة', 404);
          return jsonResponse({
            ...item,
            interviewers: parseJsonSafe((item as any).interviewers_json, []),
            scorecard: parseJsonSafe((item as any).scorecard_json, null),
          });
        }

        query += ' ORDER BY date DESC, start_time DESC';
        const { results } = await env.DB.prepare(query).bind(...bindings).all();
        const mapped = (results || []).map((i: any) => ({
          ...i,
          interviewers: parseJsonSafe(i.interviewers_json, []),
          scorecard: parseJsonSafe(i.scorecard_json, null),
        }));
        return jsonResponse(mapped);
      }

      case 'offers': {
        let query = 'SELECT * FROM ats_offers';
        const bindings: any[] = [];
        if (id) {
          query += ' WHERE id = ?';
          bindings.push(id);
          const item = await env.DB.prepare(query).bind(...bindings).first();
          if (!item) return errorResponse('العرض غير موجود', 404);
          return jsonResponse(mapOfferRow(item));
        }

        if (companyId && companyId !== 'all') {
          query += ' WHERE company_id = ?';
          bindings.push(companyId);
        }
        query += ' ORDER BY created_at DESC';

        const { results } = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse((results || []).map(mapOfferRow));
      }

      case 'portal-config': {
        const cfg = await env.DB.prepare(
          'SELECT id, company_mode, company_id, company_name_ar, updated_at FROM ats_portal_config WHERE id = ?'
        )
          .bind('default')
          .first<any>();

        return jsonResponse({
          companyMode: cfg?.company_mode || 'selected',
          companyId: cfg?.company_id || '',
          companyNameAr: cfg?.company_name_ar || '',
          updatedAt: cfg?.updated_at || '',
        });
      }

      default:
        return errorResponse(`المسار غير معروف: ${resource}`, 404);
    }
  } catch (err: any) {
    return errorResponse(`خطأ في معالجة طلب ATS: ${err.message}`, 500);
  }
};

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { env, request } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);
    }

    await ensureATSSchema(env.DB);
    const { resource, id } = parsePath(context);
    const body = await request.json().catch(() => ({}));

    switch (resource) {
      case 'jobs':
      case 'requisitions': {
        const item = body as any;
        const jobId = item.id || id || `req_${Date.now()}`;
        const code = item.code || `REQ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
        const payloadObj = { ...item, id: jobId, code };

        await env.DB.prepare(`
          INSERT INTO ats_jobs (
            id, code, title, title_en, company_id, company_name, department, location,
            employment_type, experience_level, min_salary, max_salary, currency,
            target_hire_date, headcount, filled_count, status, description,
            requirements_json, responsibilities_json, recruiter_id, recruiter_name,
            recruiter_avatar, current_tier, approval_chain_json, published_at, payload_json, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            code = excluded.code,
            title = excluded.title,
            title_en = excluded.title_en,
            company_id = excluded.company_id,
            company_name = excluded.company_name,
            department = excluded.department,
            location = excluded.location,
            employment_type = excluded.employment_type,
            experience_level = excluded.experience_level,
            min_salary = excluded.min_salary,
            max_salary = excluded.max_salary,
            currency = excluded.currency,
            target_hire_date = excluded.target_hire_date,
            headcount = excluded.headcount,
            filled_count = excluded.filled_count,
            status = excluded.status,
            description = excluded.description,
            requirements_json = excluded.requirements_json,
            responsibilities_json = excluded.responsibilities_json,
            recruiter_id = excluded.recruiter_id,
            recruiter_name = excluded.recruiter_name,
            recruiter_avatar = excluded.recruiter_avatar,
            current_tier = excluded.current_tier,
            approval_chain_json = excluded.approval_chain_json,
            published_at = excluded.published_at,
            payload_json = excluded.payload_json,
            updated_at = CURRENT_TIMESTAMP
        `).bind(
          jobId,
          code,
          item.title || '',
          item.titleEn || item.title_en || '',
          item.companyId || item.company_id || 'comp_01',
          item.companyName || item.company_name || '',
          item.department || '',
          item.location || '',
          item.employmentType || item.employment_type || 'full_time',
          item.experienceLevel || item.experience_level || 'mid',
          item.budgetMin ?? item.minSalary ?? item.min_salary ?? 0,
          item.budgetMax ?? item.maxSalary ?? item.max_salary ?? 0,
          item.currency || 'EGP',
          item.targetHireDate || item.target_hire_date || '',
          item.headcount || 1,
          item.filledCount || item.filled_count || 0,
          item.status || 'published',
          item.description || '',
          JSON.stringify(item.requirements || []),
          JSON.stringify(item.responsibilities || []),
          item.recruiterId || item.recruiter_id || '',
          item.recruiterName || item.recruiter_name || '',
          item.recruiterAvatar || item.recruiter_avatar || '',
          item.currentTier || item.current_tier || 1,
          JSON.stringify(item.approvalChain || item.approval_chain || []),
          item.publishedAt || item.published_at || new Date().toISOString().substring(0, 10),
          JSON.stringify(payloadObj)
        ).run();

        return jsonResponse({ success: true, id: jobId, code });
      }

      case 'candidates': {
        const item = body as any;
        const candId = item.id || id || `cand_${Date.now()}`;
        const cleanForm = item.applicationForm
          ? { ...item.applicationForm }
          : undefined;

        let finalResumeUrl = item.resumeUrl || item.resume_url || '';
        const finalResumeName =
          item.resumeName || item.resume_name || cleanForm?.cvFileName || cleanForm?.scannedPaperFormName || '';

        const cvDataUrl = cleanForm?.cvFileDataUrl || (finalResumeUrl.startsWith('data:') ? finalResumeUrl : '');
        if (cvDataUrl && cvDataUrl.startsWith('data:')) {
          const cvApiUrl = await saveAttachmentChunks(
            env.DB,
            candId,
            'cv',
            cleanForm?.cvFileName || finalResumeName || 'cv.pdf',
            cvDataUrl
          );
          finalResumeUrl = cvApiUrl;
          if (cleanForm) {
            cleanForm.cvFileDataUrl = cvApiUrl;
          }
        }

        const scannedDataUrl = cleanForm?.scannedPaperFormDataUrl || '';
        if (scannedDataUrl && scannedDataUrl.startsWith('data:')) {
          const scannedApiUrl = await saveAttachmentChunks(
            env.DB,
            candId,
            'scanned_form',
            cleanForm?.scannedPaperFormName || 'application_scan.pdf',
            scannedDataUrl
          );
          if (cleanForm) {
            cleanForm.scannedPaperFormDataUrl = scannedApiUrl;
          }
          if (!finalResumeUrl) {
            finalResumeUrl = scannedApiUrl;
          }
        }

        const cleanPayload = {
          ...item,
          id: candId,
          resumeUrl: finalResumeUrl,
          resumeName: finalResumeName,
          ...(cleanForm ? { applicationForm: cleanForm } : {}),
        };

        await env.DB.prepare(`
          INSERT INTO ats_candidates (
            id, name, name_en, email, phone, national_id, location, headline,
            current_company, current_title, total_years_experience, education,
            stage, status, match_score, requisition_id, company_id, tags_json,
            skills_json, resume_url, resume_name, applied_at, source, source_details,
            rejection_reason, expected_salary, current_salary, notice_period_days,
            notes_json, activities_json, payload_json, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            name_en = excluded.name_en,
            email = excluded.email,
            phone = excluded.phone,
            national_id = excluded.national_id,
            location = excluded.location,
            headline = excluded.headline,
            current_company = excluded.current_company,
            current_title = excluded.current_title,
            total_years_experience = excluded.total_years_experience,
            education = excluded.education,
            stage = excluded.stage,
            status = excluded.status,
            match_score = excluded.match_score,
            requisition_id = excluded.requisition_id,
            company_id = excluded.company_id,
            tags_json = excluded.tags_json,
            skills_json = excluded.skills_json,
            resume_url = excluded.resume_url,
            resume_name = excluded.resume_name,
            applied_at = excluded.applied_at,
            source = excluded.source,
            source_details = excluded.source_details,
            rejection_reason = excluded.rejection_reason,
            expected_salary = excluded.expected_salary,
            current_salary = excluded.current_salary,
            notice_period_days = excluded.notice_period_days,
            notes_json = excluded.notes_json,
            activities_json = excluded.activities_json,
            payload_json = excluded.payload_json,
            updated_at = CURRENT_TIMESTAMP
        `).bind(
          candId,
          item.name || '',
          item.nameEn || item.name_en || '',
          item.email || '',
          item.phone || '',
          item.nationalId || item.national_id || '',
          item.location || '',
          item.jobTitle || item.headline || '',
          item.currentCompany || item.current_company || '',
          item.currentTitle || item.current_title || '',
          item.experienceYears ?? item.totalYearsExperience ?? item.total_years_experience ?? 0,
          item.education || '',
          item.stage || 'applied',
          item.status || 'active',
          item.matchScore ?? item.match_score ?? 0,
          item.jobId || item.requisitionId || item.requisition_id || 'general_application',
          item.companyId || item.company_id || 'comp_01',
          JSON.stringify(item.tags || []),
          JSON.stringify(item.skills || item.parsedResume?.extractedSkills || []),
          finalResumeUrl,
          finalResumeName,
          item.appliedAt || item.applied_at || new Date().toISOString().substring(0, 10),
          item.source || 'direct',
          item.utmSource || item.sourceDetails || item.source_details || '',
          item.rejectionReason || item.rejection_reason || '',
          item.expectedSalary ?? item.expected_salary ?? 0,
          item.currentSalary ?? item.current_salary ?? 0,
          item.noticePeriodDays ?? item.notice_period_days ?? 30,
          JSON.stringify(item.notes || []),
          JSON.stringify(item.activities || []),
          JSON.stringify(cleanPayload)
        ).run();

        return jsonResponse({ success: true, id: candId, resumeUrl: finalResumeUrl });
      }

      case 'interviews': {
        const item = body as any;
        const intId = item.id || id || `int_${Date.now()}`;

        await env.DB.prepare(`
          INSERT INTO ats_interviews (
            id, requisition_id, requisition_title, candidate_id, candidate_name,
            candidate_avatar, date, start_time, end_time, type, format, meeting_link,
            location, status, interviewers_json, scorecard_id, scorecard_json, notes, payload_json, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            requisition_id = excluded.requisition_id,
            requisition_title = excluded.requisition_title,
            candidate_id = excluded.candidate_id,
            candidate_name = excluded.candidate_name,
            candidate_avatar = excluded.candidate_avatar,
            date = excluded.date,
            start_time = excluded.start_time,
            end_time = excluded.end_time,
            type = excluded.type,
            format = excluded.format,
            meeting_link = excluded.meeting_link,
            location = excluded.location,
            status = excluded.status,
            interviewers_json = excluded.interviewers_json,
            scorecard_id = excluded.scorecard_id,
            scorecard_json = excluded.scorecard_json,
            notes = excluded.notes,
            payload_json = excluded.payload_json,
            updated_at = CURRENT_TIMESTAMP
        `).bind(
          intId,
          item.jobId || item.requisitionId || item.requisition_id || '',
          item.jobTitle || item.requisitionTitle || item.requisition_title || '',
          item.candidateId || item.candidate_id || '',
          item.candidateName || item.candidate_name || '',
          item.candidateAvatar || item.candidate_avatar || '',
          item.date || new Date().toISOString().substring(0, 10),
          item.startTime || item.start_time || '10:00',
          item.endTime || item.end_time || '11:00',
          item.type || 'technical',
          item.format || item.platform || 'video',
          item.meetingLink || item.meeting_link || '',
          item.location || item.locationDetails || '',
          item.status || 'scheduled',
          JSON.stringify(item.interviewers || []),
          item.scorecardId || item.scorecard_id || '',
          JSON.stringify(item.scorecard || null),
          item.notes || '',
          JSON.stringify(item)
        ).run();

        return jsonResponse({ success: true, id: intId });
      }

      case 'offers': {
        const item = body as any;
        const offerId = item.id || id || `off_${Date.now()}`;
        let finalSignedUrl = item.signedOfferDataUrl || '';
        const ownerKey = item.candidateId || item.candidate_id || offerId;

        if (finalSignedUrl && finalSignedUrl.startsWith('data:')) {
          finalSignedUrl = await saveAttachmentChunks(
            env.DB,
            ownerKey,
            'signed_offer',
            item.signedOfferFileName || 'signed_job_offer.pdf',
            finalSignedUrl
          );
        }

        const cleanOffer = {
          ...item,
          id: offerId,
          ...(finalSignedUrl ? { signedOfferDataUrl: finalSignedUrl } : {}),
        };

        await env.DB.prepare(`
          INSERT INTO ats_offers (
            id, candidate_id, candidate_name, candidate_email, candidate_phone,
            requisition_id, job_title, department, company_id, company_name,
            start_date, compensation_json, preboarding_documents_json,
            candidate_signature_json, status, is_synced_to_core_hr,
            core_hr_employee_id, notes, expires_at, payload_json, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            candidate_id = excluded.candidate_id,
            candidate_name = excluded.candidate_name,
            candidate_email = excluded.candidate_email,
            candidate_phone = excluded.candidate_phone,
            requisition_id = excluded.requisition_id,
            job_title = excluded.job_title,
            department = excluded.department,
            company_id = excluded.company_id,
            company_name = excluded.company_name,
            start_date = excluded.start_date,
            compensation_json = excluded.compensation_json,
            preboarding_documents_json = excluded.preboarding_documents_json,
            candidate_signature_json = excluded.candidate_signature_json,
            status = excluded.status,
            is_synced_to_core_hr = excluded.is_synced_to_core_hr,
            core_hr_employee_id = excluded.core_hr_employee_id,
            notes = excluded.notes,
            expires_at = excluded.expires_at,
            payload_json = excluded.payload_json,
            updated_at = CURRENT_TIMESTAMP
        `).bind(
          offerId,
          item.candidateId || item.candidate_id || '',
          item.candidateName || item.candidate_name || '',
          item.candidateEmail || item.candidate_email || '',
          item.candidatePhone || item.candidate_phone || '',
          item.jobId || item.requisitionId || item.requisition_id || '',
          item.jobTitle || item.job_title || '',
          item.department || '',
          item.companyId || item.company_id || 'comp_01',
          item.companyName || item.company_name || '',
          item.joiningDate || item.startDate || item.start_date || '',
          JSON.stringify(item.compensation || null),
          JSON.stringify(item.preboardingDocuments || item.preboarding_documents || []),
          JSON.stringify(item.candidateSignature || item.candidate_signature || null),
          item.status || 'draft',
          item.isSyncedToCoreHR || item.is_synced_to_core_hr ? 1 : 0,
          item.coreHREmployeeId || item.core_hr_employee_id || '',
          item.notes || item.termsAndConditions || '',
          item.expiryDate || item.expiresAt || item.expires_at || '',
          JSON.stringify(cleanOffer)
        ).run();

        return jsonResponse({ success: true, id: offerId, signedOfferDataUrl: finalSignedUrl });
      }

      case 'portal-config': {
        const item = body as any;
        const companyMode = item.companyMode === 'manual' ? 'manual' : 'selected';
        const companyId = item.companyId ? String(item.companyId) : '';
        const companyNameAr = item.companyNameAr ? String(item.companyNameAr).trim() : '';

        await env.DB.prepare(`
          INSERT INTO ats_portal_config (id, company_mode, company_id, company_name_ar, updated_at)
          VALUES ('default', ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            company_mode = excluded.company_mode,
            company_id = excluded.company_id,
            company_name_ar = excluded.company_name_ar,
            updated_at = CURRENT_TIMESTAMP
        `).bind(companyMode, companyId, companyNameAr).run();

        return jsonResponse({
          success: true,
          companyMode,
          companyId,
          companyNameAr,
        });
      }

      default:
        return errorResponse(`المسار غير معروف: ${resource}`, 404);
    }
  } catch (err: any) {
    return errorResponse(`خطأ في حفظ بيانات ATS: ${err.message}`, 500);
  }
};

export const onRequestPatch: PagesFunction = async (context) => {
  try {
    const { env, request } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);
    }

    await ensureATSSchema(env.DB);
    const { resource, id, subAction } = parsePath(context);
    const body = await request.json().catch(() => ({}));

    if (resource === 'candidates' && id) {
      if (subAction === 'stage' || body.stage) {
        const newStage = body.stage;
        const note = body.noteText || '';

        const cand = await env.DB.prepare('SELECT * FROM ats_candidates WHERE id = ?').bind(id).first<any>();
        if (!cand) return errorResponse('المرشح غير موجود', 404);

        const activities = parseJsonSafe<any[]>(cand.activities_json, []);
        activities.unshift({
          id: `act_${Date.now()}`,
          type: 'stage_change',
          title: `تغيير المرحلة إلى: ${newStage}`,
          titleEn: `Stage changed to: ${newStage}`,
          description: note || 'تم تحديث المرحلة عبر الكانبان',
          performedBy: body.performedBy || 'النظام الإداري',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        });

        const nextStatus = newStage === 'rejected' ? 'rejected' : newStage === 'hired' ? 'hired' : 'active';
        const existingPayload = parseJsonSafe<Record<string, any>>(cand.payload_json, {});
        const updatedPayload = {
          ...existingPayload,
          stage: newStage,
          status: nextStatus,
          activities,
          updatedAt: new Date().toISOString(),
        };

        await env.DB.prepare(`
          UPDATE ats_candidates
          SET stage = ?, status = ?, activities_json = ?, payload_json = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(newStage, nextStatus, JSON.stringify(activities), JSON.stringify(updatedPayload), id).run();

        return jsonResponse({ success: true, id, stage: newStage, status: nextStatus });
      }
    }

    return errorResponse('طلب غير صالح', 400);
  } catch (err: any) {
    return errorResponse(`خطأ في تحديث ATS: ${err.message}`, 500);
  }
};

export const onRequestDelete: PagesFunction = async (context) => {
  try {
    const { env } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);
    }

    await ensureATSSchema(env.DB);
    const { resource, id } = parsePath(context);
    if (!id) return errorResponse('معرف السجل مطلوب للحذف', 400);

    const tableMap: Record<string, string> = {
      jobs: 'ats_jobs',
      requisitions: 'ats_jobs',
      candidates: 'ats_candidates',
      interviews: 'ats_interviews',
      offers: 'ats_offers',
    };

    const tableName = tableMap[resource];
    if (!tableName) return errorResponse(`لا يمكن حذف الكيان: ${resource}`, 400);

    await env.DB.prepare(`DELETE FROM ${tableName} WHERE id = ?`).bind(id).run();
    if (resource === 'candidates') {
      await env.DB.prepare('DELETE FROM ats_attachments WHERE candidate_id = ?').bind(id).run().catch(() => {});
    }
    return jsonResponse({ success: true, id, message: 'تم الحذف بنجاح' });
  } catch (err: any) {
    return errorResponse(`خطأ في حذف سجل ATS: ${err.message}`, 500);
  }
};

