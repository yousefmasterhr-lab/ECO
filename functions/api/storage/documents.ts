import {
  PagesFunction,
  jsonResponse,
  errorResponse,
  handleOptions,
} from '../_utils';

export const onRequestOptions: PagesFunction = async () => {
  return handleOptions();
};

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const { request, env } = context;

    if (!env.DB) {
      return errorResponse('قاعدة بيانات D1 غير متصلة', 500);
    }

    const url = new URL(request.url);
    const moduleType = url.searchParams.get('module_type') || url.searchParams.get('moduleType');
    const entityId = url.searchParams.get('entity_id') || url.searchParams.get('entityId');
    const limit = Math.min(Number(url.searchParams.get('limit')) || 100, 300);

    let query = `
      SELECT id, module_type, entity_id, file_name, r2_object_key, file_size_bytes, mime_type, uploaded_by_user_id, created_at
      FROM department_documents
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (moduleType && moduleType !== 'ALL') {
      conditions.push('module_type = ?');
      params.push(moduleType.toUpperCase());
    }

    if (entityId) {
      conditions.push('entity_id = ?');
      params.push(entityId);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(limit);

    const result = await env.DB.prepare(query).bind(...params).all();

    const documents = (result.results || []).map((row: any) => ({
      id: row.id,
      moduleType: row.module_type,
      entityId: row.entity_id,
      fileName: row.file_name,
      r2ObjectKey: row.r2_object_key,
      fileSizeBytes: row.file_size_bytes,
      mimeType: row.mime_type,
      uploadedByUserId: row.uploaded_by_user_id,
      downloadUrl: `/api/storage/download?key=${encodeURIComponent(row.r2_object_key)}`,
      createdAt: row.created_at,
    }));

    return jsonResponse({
      success: true,
      documents,
      count: documents.length,
    });
  } catch (err: any) {
    return errorResponse(`خطأ في استعلام سجل المستندات: ${err.message || String(err)}`, 500);
  }
};

export const onRequestDelete: PagesFunction = async (context) => {
  try {
    const { request, env } = context;

    if (!env.DB || !env.DOCS_VAULT) {
      return errorResponse('قاعدة بيانات D1 أو حاوية R2 غير متصلة', 500);
    }

    const url = new URL(request.url);
    const docId = url.searchParams.get('id');

    if (!docId) {
      return errorResponse('معرف المستند مطلوب للحذف', 400);
    }

    const doc: any = await env.DB.prepare(
      `SELECT r2_object_key, file_name FROM department_documents WHERE id = ? LIMIT 1`
    ).bind(docId).first();

    if (!doc) {
      return errorResponse('المستند غير موجود', 404);
    }

    // Delete from R2 Bucket
    await env.DOCS_VAULT.delete(doc.r2_object_key);

    // Delete from D1 DB
    await env.DB.prepare(`DELETE FROM department_documents WHERE id = ?`).bind(docId).run();

    return jsonResponse({
      success: true,
      message: 'تم حذف المستند بنجاح من الخزينة وقاعدة البيانات',
    });
  } catch (err: any) {
    return errorResponse(`خطأ في حذف المستند: ${err.message || String(err)}`, 500);
  }
};
