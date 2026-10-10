import {
  PagesFunction,
  errorResponse,
  handleOptions,
} from '../_utils';

export const onRequestOptions: PagesFunction = async () => {
  return handleOptions();
};

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const { request, env } = context;

    if (!env.DOCS_VAULT) {
      return errorResponse('حاوية تخزين المستندات R2 غير متصلة', 500);
    }

    const url = new URL(request.url);
    let key = url.searchParams.get('key');
    const docId = url.searchParams.get('id');

    let fileName = 'downloaded_document';
    let mimeType = 'application/octet-stream';

    // If ID provided and DB available, resolve key and metadata from D1
    if (docId && env.DB) {
      const doc: any = await env.DB.prepare(
        `SELECT r2_object_key, file_name, mime_type FROM department_documents WHERE id = ? LIMIT 1`
      ).bind(docId).first();

      if (doc) {
        key = doc.r2_object_key;
        fileName = doc.file_name;
        mimeType = doc.mime_type;
      }
    }

    if (!key) {
      return errorResponse('معرف الكائن أو المستند مطلوب (key or id parameter missing)', 400);
    }

    // Get object from R2 bucket DOCS_VAULT
    const object = await env.DOCS_VAULT.get(key);

    if (!object) {
      return errorResponse('المستند المطلوب غير موجود في خزينة التخزين (Object not found)', 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata?.(headers);
    headers.set('ETag', object.httpEtag);
    headers.set('Content-Type', mimeType || object.httpMetadata?.contentType || 'application/octet-stream');
    headers.set('Content-Length', object.size.toString());
    
    // Check if inline view or attachment requested
    const asAttachment = url.searchParams.get('attachment') === 'true';
    const dispositionType = asAttachment ? 'attachment' : 'inline';
    headers.set('Content-Disposition', `${dispositionType}; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    headers.set('Cache-Control', 'public, max-age=86400');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(object.body, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return errorResponse(`خطأ في استرجاع المستند من R2: ${err.message || String(err)}`, 500);
  }
};
