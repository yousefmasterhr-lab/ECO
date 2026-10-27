import type { D1Database as _D1Database, R2Bucket as _R2Bucket } from './api/_utils';

declare global {
  type D1Database = _D1Database;
  type R2Bucket = _R2Bucket;
}
