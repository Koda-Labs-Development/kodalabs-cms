import { CollectionConfig } from 'payload/types';
import { isAdmin } from '../access';

/**
 * Sites Collection - Multi-tenant Configuration
 * Each site represents a frontend application (e.g., pjouclt.com.br, kodalabs.dev)
 * that consumes content from this CMS
 */
export const Sites: CollectionConfig = {
  slug: 'sites',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'domain', 'status'],
    group: 'Configuration',
  },
  access: {
    // Only admins can manage sites
    create: isAdmin,
    read: () => true, // Public API can read site info
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Site Name',
      admin: {
        description: 'Display name for the site (e.g., "PJ ou CLT", "KodaLabs")',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'Unique identifier for API queries (e.g., "pj-ou-clt", "kodalabs")',
      },
      validate: (val: any) => {
        if (val && typeof val === 'string' && !/^[a-z0-9-]+$/.test(val)) {
          return 'Slug must contain only lowercase letters, numbers, and hyphens';
        }
        return true;
      },
    },
    {
      name: 'domain',
      type: 'text',
      required: true,
      label: 'Domain',
      admin: {
        description: 'Primary domain (e.g., "pjouclt.com.br", "kodalabs.dev")',
      },
    },
    {
      name: 'apiKey',
      type: 'text',
      unique: true,
      label: 'API Key',
      admin: {
        description: 'Auto-generated API key for frontend authentication (optional)',
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ value }: any) => {
            // Auto-generate API key if not provided
            if (!value) {
              return `site_${crypto.randomUUID().replace(/-/g, '')}`;
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'webhookUrl',
      type: 'text',
      label: 'Webhook URL',
      admin: {
        description: 'Vercel deployment webhook or custom rebuild endpoint (optional)',
        placeholder: 'https://api.vercel.com/v1/integrations/deploy/...',
      },
    },
    {
      name: 'defaultLanguage',
      type: 'select',
      required: true,
      defaultValue: 'pt',
      label: 'Default Language',
      options: [
        { label: 'Português (Brasil)', value: 'pt' },
        { label: 'English', value: 'en' },
        { label: 'Español', value: 'es' },
      ],
      admin: {
        description: 'Default language for content in this site',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      label: 'Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      admin: {
        description: 'Active sites can receive content, inactive sites are hidden from public API',
      },
    },
  ],
};
