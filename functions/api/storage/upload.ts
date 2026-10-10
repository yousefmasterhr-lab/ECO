import {
  PagesFunction,
  jsonResponse,
  errorResponse,
  handleOptions,
} from '../_utils';

export const onRequestOptions: PagesFunction = async () => {
  return handleOptions();
};

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { request, env } = context;

    if (!env.DOCS_VAULT) {
      return errorResponse('حاوية تخزين المستندات R2 غير متصلة (DOCS_VAULT binding is missing)', 500);
    }
    if (!env.DB) {
      return errorResponse('قاعدة بيانات D1 غير متصلة', 500);
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return errorResponse('يجب إرسال الملف بتنسيق multipart/form-data', 400);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const moduleType = (formData.get('module_type') || formData.get('moduleType') || 'HR').toString().toUpperCase();
    const entityId = (formData.get('entity_id') || formData.get('entityId') || 'general').toString();
    const uploadedBy = (formData.get('uploaded_by_user_id') || formData.get('userId') || 'usr_root_csuite_01').toString();

    if (!file) {
      return errorResponse('الملف مطلوب (File is missing in form data)', 400);
    }

    const fileName = file.name || 'document.bin';
    const fileSize = file.size;
    const mimeType = file.type || 'application/octet-stream';

    // Generate unique R2 object key
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const docId = 'doc_' + crypto.randomUUID();
    const r2Key = `${moduleType.toLowerCase()}/${entityId}/${Date.now()}_${sanitizedFileName}`;

    // 1. Upload file buffer stream to Cloudflare R2 bucket DOCS_VAULT
    const fileArrayBuffer = await file.arrayBuffer();
    await env.DOCS_VAULT.put(r2Key, fileArrayBuffer, {
      httpMetadata: {
        contentType: mimeType,
      },
      customMetadata: {
        originalName: fileName,
        moduleType,
        entityId,
        uploadedBy,
        docId,
      },
    });

    // 2. Record metadata in department_documents in D1
    await env.DB.prepare(
      `INSERT INTO department_documents (
        id, module_type, entity_id, file_name, r2_object_key,
        file_size_bytes, mime_type, uploaded_by_user_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(
      docId,
      moduleType,
      entityId,
      fileName,
      r2Key,
      fileSize,
      mimeType,
      uploadedBy
    ).run();

    // 3. Record audit trail entry
    const auditId = 'log_' + crypto.randomUUID();
    try {
      await env.DB.prepare(
        `INSERT INTO audit_logs (id, user_id, user_name, category, action, details)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        auditId,
        uploadedBy,
        'مدير المستندات',
        'إعدادات النظام',
        'أرشفة مستند في خزينة R2',
        `تم حفظ المستند "${fileName}" بحجم (${(fileSize / 1024).toFixed(1)} KB) لقسم: ${moduleType} ومعرف الكيان: ${entityId}`
      ).run();
    } catch (auditErr) {
      console.warn('Failed to log document upload in audit_logs:', auditErr);
    }

    return jsonResponse({
      success: true,
      document: {
        id: docId,
        fileName,
        moduleType,
        entityId,
        r2ObjectKey: r2Key,
        fileSizeBytes: fileSize,
        mimeType,
        uploadedBy,
        downloadUrl: `/api/storage/download?key=${encodeURIComponent(r2Key)}`,
        createdAt: new Date().toISOString(),
      },
      message: 'تم رفع المستند وأرشفته بنجاح في خزينة R2 وسجل D1',
    }, 201);
  } catch (err: any) {
    return errorResponse(`خطأ في رفع الملف إلى R2: ${err.message || String(err)}`, 500);
  }
};
