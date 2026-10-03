import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

function serveStaticApp(mountPath: string, rootDir: string) {
  return (req: any, res: any, next: any) => {
    // Redirect /apps/name to /apps/name/ so relative assets resolve correctly
    if (req.url === mountPath) {
      res.writeHead(302, { Location: mountPath + '/' });
      return res.end();
    }

    if (!req.url.startsWith(mountPath + '/')) {
      return next();
    }

    let subPath = req.url.slice(mountPath.length);
    if (subPath === '' || subPath === '/' || !subPath.includes('.')) {
      subPath = '/index.html';
    }

    const cleanSub = subPath.split('?')[0];
    const filePath = path.join(rootDir, cleanSub);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.ico': 'image/x-icon'
      };

      res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
      // Ensure iframe embedding is permitted on same origin
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      return fs.createReadStream(filePath).pipe(res);
    }

    next();
  };
}

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const erpRootDir = path.resolve(currentDir, '../../');

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-standalone-apps',
      configureServer(server) {
        // Serve Full Insurance Standalone Application
        server.middlewares.use(
          serveStaticApp('/apps/insurance', path.join(erpRootDir, 'Insurance'))
        );

        // Serve Full CTS / PCMS Standalone Application
        server.middlewares.use(
          serveStaticApp('/apps/cts', path.join(erpRootDir, 'CTS/dist'))
        );

        // Serve Full ATS Standalone Application
        server.middlewares.use(
          serveStaticApp('/apps/ats', path.join(erpRootDir, 'ATS/dist'))
        );
      },
      configurePreviewServer(server) {
        server.middlewares.use(
          serveStaticApp('/apps/insurance', path.join(erpRootDir, 'Insurance'))
        );
        server.middlewares.use(
          serveStaticApp('/apps/cts', path.join(erpRootDir, 'CTS/dist'))
        );
        server.middlewares.use(
          serveStaticApp('/apps/ats', path.join(erpRootDir, 'ATS/dist'))
        );
      }
    }
  ],
  resolve: {
    alias: {
      '@erp/core': fileURLToPath(new URL('../../packages/core/src', import.meta.url)),
      '@erp/auth': fileURLToPath(new URL('../../packages/auth/src', import.meta.url)),
      '@erp/database': fileURLToPath(new URL('../../packages/database/src', import.meta.url)),
      '@erp/storage-drive': fileURLToPath(new URL('../../packages/storage-drive/src', import.meta.url)),
      '@erp/ui-system': fileURLToPath(new URL('../../packages/ui-system/src', import.meta.url)),
      '@erp/notifications': fileURLToPath(new URL('../../packages/notifications/src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    open: false,
    fs: {
      allow: ['..', erpRootDir]
    }
  }
});
