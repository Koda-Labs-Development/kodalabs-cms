import { CollectionConfig } from 'payload/types';
import { isAdmin } from '../access';

/**
 * Tags Collection - Content Labeling
 * Flexible tagging system for posts
 */
export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'site'],
    group: 'Content',
  },
  access: {
    create: isAdmin,
    read: () => true, // Public API can read tags
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data }: any) => {
        // Auto-generate slug from name if not provided
        if (!data.slug && data.name) {
          const slug = data.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
            .replace(/(^-|-$)/g, ''); // Remove leading/trailing hyphens
          data.slug = slug;
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: 'Tag Name',
      admin: {
        description: 'Display name for this tag',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'URL-friendly identifier (auto-generated from name)',
      },
      validate: (val: any) => {
        if (val && typeof val === 'string' && !/^[a-z0-9-]+$/.test(val)) {
          return 'Slug must contain only lowercase letters, numbers, and hyphens';
        }
        return true;
      },
    },
    {
      name: 'site',
      type: 'relationship',
      relationTo: 'sites',
      required: true,
      hasMany: false,
      label: 'Site',
      admin: {
        description: 'Which site this tag belongs to',
      },
    },
  ],
};
