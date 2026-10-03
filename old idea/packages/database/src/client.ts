import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export type D1DatabaseBinding = any;

export function createDatabaseClient(d1Database: D1DatabaseBinding) {
  return drizzle(d1Database, { schema });
}

export type AppDatabase = ReturnType<typeof createDatabaseClient>;
