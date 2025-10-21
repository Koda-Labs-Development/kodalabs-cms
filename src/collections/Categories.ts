import { CollectionConfig } from 'payload/types';
import { isAdmin } from '../access';

/**
 * Categories Collection - Content Taxonomy
 * Hierarchical content organization for posts
 */
export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'site'],
    group: 'Content',
  },
  access: {
    create: isAdmin,
    read: () => true, // Public API can read categories
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
      label: 'Category Name',
      admin: {
        description: 'Display name for this category',
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
      name: 'description',
      type: 'textarea',
      localized: true,
      label: 'Description',
      admin: {
        description: 'Brief description of this category',
      },
      maxLength: 300,
    },
    {
      name: 'site',
      type: 'relationship',
      relationTo: 'sites',
      required: true,
      hasMany: false,
      label: 'Site',
      admin: {
        description: 'Which site this category belongs to',
      },
    },
  ],
};
