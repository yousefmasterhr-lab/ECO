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
    const { resource, id } = parsePath(context);
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId');
    const requisitionId = url.searchParams.get('requisitionId');
    const stage = url.searchParams.get('stage');

    switch (resource) {
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
          return jsonResponse({
            ...job,
            requirements: job.requirements_json ? JSON.parse(job.requirements_json) : [],
            responsibilities: job.responsibilities_json ? JSON.parse(job.responsibilities_json) : [],
            approvalChain: job.approval_chain_json ? JSON.parse(job.approval_chain_json) : [],
          });
        }

        if (companyId && companyId !== 'all') {
          query += ' WHERE company_id = ?';
          bindings.push(companyId);
        }
        query += ' ORDER BY created_at DESC';

        const { results } = await env.DB.prepare(query).bind(...bindings).all();
        const mapped = (results || []).map((j: any) => ({
          ...j,
          requirements: j.requirements_json ? JSON.parse(j.requirements_json) : [],
          responsibilities: j.responsibilities_json ? JSON.parse(j.responsibilities_json) : [],
          approvalChain: j.approval_chain_json ? JSON.parse(j.approval_chain_json) : [],
        }));
        return jsonResponse(mapped);
      }

      case 'candidates': {
        let query = 'SELECT * FROM ats_candidates';
        const bindings: any[] = [];
        const conditions: string[] = [];

        if (id) {
          const cand = await env.DB.prepare('SELECT * FROM ats_candidates WHERE id = ?').bind(id).first();
          if (!cand) return errorResponse('المرشح غير موجود', 404);
          return jsonResponse({
            ...cand,
            tags: cand.tags_json ? JSON.parse(cand.tags_json) : [],
            skills: cand.skills_json ? JSON.parse(cand.skills_json) : [],
            notes: cand.notes_json ? JSON.parse(cand.notes_json) : [],
            activities: cand.activities_json ? JSON.parse(cand.activities_json) : [],
          });
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
        const mapped = (results || []).map((c: any) => ({
          ...c,
          tags: c.tags_json ? JSON.parse(c.tags_json) : [],
          skills: c.skills_json ? JSON.parse(c.skills_json) : [],
          notes: c.notes_json ? JSON.parse(c.notes_json) : [],
          activities: c.activities_json ? JSON.parse(c.activities_json) : [],
        }));
        return jsonResponse(mapped);
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
            interviewers: item.interviewers_json ? JSON.parse(item.interviewers_json) : [],
            scorecard: item.scorecard_json ? JSON.parse(item.scorecard_json) : null,
          });
        }

        query += ' ORDER BY date DESC, start_time DESC';
        const { results } = await env.DB.prepare(query).bind(...bindings).all();
        const mapped = (results || []).map((i: any) => ({
          ...i,
          interviewers: i.interviewers_json ? JSON.parse(i.interviewers_json) : [],
          scorecard: i.scorecard_json ? JSON.parse(i.scorecard_json) : null,
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
          return jsonResponse({
            ...item,
            compensation: item.compensation_json ? JSON.parse(item.compensation_json) : null,
            preboardingDocuments: item.preboarding_documents_json ? JSON.parse(item.preboarding_documents_json) : [],
            candidateSignature: item.candidate_signature_json ? JSON.parse(item.candidate_signature_json) : null,
          });
        }

        if (companyId && companyId !== 'all') {
          query += ' WHERE company_id = ?';
          bindings.push(companyId);
        }
        query += ' ORDER BY created_at DESC';

        const { results } = await env.DB.prepare(query).bind(...bindings).all();
        const mapped = (results || []).map((o: any) => ({
          ...o,
          compensation: o.compensation_json ? JSON.parse(o.compensation_json) : null,
          preboardingDocuments: o.preboarding_documents_json ? JSON.parse(o.preboarding_documents_json) : [],
          candidateSignature: o.candidate_signature_json ? JSON.parse(o.candidate_signature_json) : null,
        }));
        return jsonResponse(mapped);
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

        await env.DB.prepare(`
          INSERT INTO ats_jobs (
            id, code, title, title_en, company_id, company_name, department, location,
            employment_type, experience_level, min_salary, max_salary, currency,
            target_hire_date, headcount, filled_count, status, description,
            requirements_json, responsibilities_json, recruiter_id, recruiter_name,
            recruiter_avatar, current_tier, approval_chain_json, published_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
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
            updated_at = CURRENT_TIMESTAMP
        `).bind(
          jobId,
          code,
          item.title || '',
          item.titleEn || item.title_en || '',
          item.companyId || item.company_id || 'comp_1',
          item.companyName || item.company_name || 'شركة إيكو للمقاولات العامة',
          item.department || '',
          item.location || '',
          item.employmentType || item.employment_type || 'full_time',
          item.experienceLevel || item.experience_level || 'mid',
          item.minSalary || item.min_salary || 0,
          item.maxSalary || item.max_salary || 0,
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
          item.publishedAt || item.published_at || new Date().toISOString().substring(0, 10)
        ).run();

        return jsonResponse({ success: true, id: jobId, code });
      }

      case 'candidates': {
        const item = body as any;
        const candId = item.id || id || `cand_${Date.now()}`;

        await env.DB.prepare(`
          INSERT INTO ats_candidates (
            id, name, name_en, email, phone, national_id, location, headline,
            current_company, current_title, total_years_experience, education,
            stage, status, match_score, requisition_id, company_id, tags_json,
            skills_json, resume_url, resume_name, applied_at, source, source_details,
            rejection_reason, expected_salary, current_salary, notice_period_days,
            notes_json, activities_json, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
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
            updated_at = CURRENT_TIMESTAMP
        `).bind(
          candId,
          item.name || '',
          item.nameEn || item.name_en || '',
          item.email || '',
          item.phone || '',
          item.nationalId || item.national_id || '',
          item.location || '',
          item.headline || '',
          item.currentCompany || item.current_company || '',
          item.currentTitle || item.current_title || '',
          item.totalYearsExperience || item.total_years_experience || 0,
          item.education || '',
          item.stage || 'applied',
          item.status || 'active',
          item.matchScore || item.match_score || 0,
          item.requisitionId || item.requisition_id || '',
          item.companyId || item.company_id || 'comp_1',
          JSON.stringify(item.tags || []),
          JSON.stringify(item.skills || []),
          item.resumeUrl || item.resume_url || '',
          item.resumeName || item.resume_name || '',
          item.appliedAt || item.applied_at || new Date().toISOString().substring(0, 10),
          item.source || 'direct',
          item.sourceDetails || item.source_details || '',
          item.rejectionReason || item.rejection_reason || '',
          item.expectedSalary || item.expected_salary || 0,
          item.currentSalary || item.current_salary || 0,
          item.noticePeriodDays || item.notice_period_days || 30,
          JSON.stringify(item.notes || []),
          JSON.stringify(item.activities || [])
        ).run();

        return jsonResponse({ success: true, id: candId });
      }

      case 'interviews': {
        const item = body as any;
        const intId = item.id || id || `int_${Date.now()}`;

        await env.DB.prepare(`
          INSERT INTO ats_interviews (
            id, requisition_id, requisition_title, candidate_id, candidate_name,
            candidate_avatar, date, start_time, end_time, type, format, meeting_link,
            location, status, interviewers_json, scorecard_id, scorecard_json, notes, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
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
            updated_at = CURRENT_TIMESTAMP
        `).bind(
          intId,
          item.requisitionId || item.requisition_id || '',
          item.requisitionTitle || item.requisition_title || '',
          item.candidateId || item.candidate_id || '',
          item.candidateName || item.candidate_name || '',
          item.candidateAvatar || item.candidate_avatar || '',
          item.date || new Date().toISOString().substring(0, 10),
          item.startTime || item.start_time || '10:00',
          item.endTime || item.end_time || '11:00',
          item.type || 'technical',
          item.format || 'video',
          item.meetingLink || item.meeting_link || '',
          item.location || '',
          item.status || 'scheduled',
          JSON.stringify(item.interviewers || []),
          item.scorecardId || item.scorecard_id || '',
          JSON.stringify(item.scorecard || null),
          item.notes || ''
        ).run();

        return jsonResponse({ success: true, id: intId });
      }

      case 'offers': {
        const item = body as any;
        const offerId = item.id || id || `off_${Date.now()}`;

        await env.DB.prepare(`
          INSERT INTO ats_offers (
            id, candidate_id, candidate_name, candidate_email, candidate_phone,
            requisition_id, job_title, department, company_id, company_name,
            start_date, compensation_json, preboarding_documents_json,
            candidate_signature_json, status, is_synced_to_core_hr,
            core_hr_employee_id, notes, expires_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
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
            updated_at = CURRENT_TIMESTAMP
        `).bind(
          offerId,
          item.candidateId || item.candidate_id || '',
          item.candidateName || item.candidate_name || '',
          item.candidateEmail || item.candidate_email || '',
          item.candidatePhone || item.candidate_phone || '',
          item.requisitionId || item.requisition_id || '',
          item.jobTitle || item.job_title || '',
          item.department || '',
          item.companyId || item.company_id || 'comp_1',
          item.companyName || item.company_name || 'شركة إيكو للمقاولات العامة',
          item.startDate || item.start_date || '',
          JSON.stringify(item.compensation || null),
          JSON.stringify(item.preboardingDocuments || item.preboarding_documents || []),
          JSON.stringify(item.candidateSignature || item.candidate_signature || null),
          item.status || 'draft',
          item.isSyncedToCoreHR || item.is_synced_to_core_hr ? 1 : 0,
          item.coreHREmployeeId || item.core_hr_employee_id || '',
          item.notes || '',
          item.expiresAt || item.expires_at || ''
        ).run();

        return jsonResponse({ success: true, id: offerId });
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

        // Fetch current candidate
        const cand = await env.DB.prepare('SELECT * FROM ats_candidates WHERE id = ?').bind(id).first<any>();
        if (!cand) return errorResponse('المرشح غير موجود', 404);

        const activities = cand.activities_json ? JSON.parse(cand.activities_json) : [];
        activities.unshift({
          id: `act_${Date.now()}`,
          type: 'stage_change',
          title: `تغيير المرحلة إلى: ${newStage}`,
          titleEn: `Stage changed to: ${newStage}`,
          description: note || 'تم تحديث المرحلة عبر الكانبان',
          performedBy: body.performedBy || 'النظام الإداري',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        });

        await env.DB.prepare(`
          UPDATE ats_candidates
          SET stage = ?, activities_json = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(newStage, JSON.stringify(activities), id).run();

        return jsonResponse({ success: true, id, stage: newStage });
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
    return jsonResponse({ success: true, id, message: 'تم الحذف بنجاح' });
  } catch (err: any) {
    return errorResponse(`خطأ في حذف سجل ATS: ${err.message}`, 500);
  }
};

