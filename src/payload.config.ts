import { buildConfig } from 'payload/config';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { slateEditor } from '@payloadcms/richtext-slate';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import path from 'path';

// Import collections
import { Sites } from './collections/Sites';
import { Posts } from './collections/Posts';
import { Categories } from './collections/Categories';
import { Tags } from './collections/Tags';
import { Media } from './collections/Media';
import { Users } from './collections/Users';

/**
 * Payload CMS v2 Configuration
 * Multi-tenant headless CMS for KodaLabs ecosystem
 */
export default buildConfig({
  // Admin panel configuration
  admin: {
    user: 'users',
    bundler: webpackBundler(),
    meta: {
      titleSuffix: '- KodaLabs CMS',
    },
  },

  // Collections registration
  collections: [
    Sites,
    Posts,
    Categories,
    Tags,
    Media,
    Users,
  ],

  // Database: PostgreSQL 16
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    push: true, // Auto-push schema changes in development (no interactive prompts)
  }),

  // Default rich text editor
  editor: slateEditor({}),

  // Server URL for admin panel
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',

  // TypeScript generation
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },

  // Localization configuration
  localization: {
    locales: ['pt', 'en', 'es'],
    defaultLocale: 'pt',
    fallback: true,
  },

  // CORS configuration for frontend apps
  cors: [
    // Production domains
    'https://pjouclt.com.br',
    'https://pjvsclt.com.br',
    'https://kodalabs.dev',
    'https://cms.kodalabs.dev',

    // Local development
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',

    // Environment-specific origins
    ...(process.env.CORS_ORIGIN_PJ_CLT ? [process.env.CORS_ORIGIN_PJ_CLT] : []),
    ...(process.env.CORS_ORIGIN_PJ_VS_CLT ? [process.env.CORS_ORIGIN_PJ_VS_CLT] : []),
    ...(process.env.CORS_ORIGIN_KODALABS ? [process.env.CORS_ORIGIN_KODALABS] : []),
  ],

  // CSRF protection
  csrf: [
    'https://pjouclt.com.br',
    'https://pjvsclt.com.br',
    'https://kodalabs.dev',
    'https://cms.kodalabs.dev',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
  ],

  // GraphQL configuration (optional, enabled by default)
  graphQL: {
    disable: false,
  },

  // Upload configuration
  upload: {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
  },
});
