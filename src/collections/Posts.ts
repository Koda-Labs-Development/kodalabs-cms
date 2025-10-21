import { CollectionConfig } from 'payload/types';
import { isAdmin, isPublished } from '../access';
import { triggerWebhook } from '../hooks';
import { slateEditor } from '@payloadcms/richtext-slate';

/**
 * Posts Collection - Blog Articles
 * Multi-language blog posts with SEO optimization and versioning
 */
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'site', 'status', 'publishedAt'],
    group: 'Content',
  },
  access: {
    create: isAdmin,
    read: isPublished, // Public sees published, admins see all
    update: isAdmin,
    delete: isAdmin,
  },
  versions: {
    drafts: true, // Enable draft/published workflow
  },
  hooks: {
    afterChange: [triggerWebhook], // Trigger webhook on publish
    beforeChange: [
      ({ data, operation }: any) => {
        // Auto-generate slug from title if not provided
        if (!data.slug && data.title) {
          const slug = data.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
            .replace(/(^-|-$)/g, ''); // Remove leading/trailing hyphens
          data.slug = slug;
        }

        // Set publishedAt on first publish
        if (operation === 'update' && data.status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date();
        }

        return data;
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: 'Title',
      admin: {
        description: 'Post title (max 100 characters for SEO)',
      },
      maxLength: 100,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'URL-friendly identifier (auto-generated from title)',
      },
      validate: (val: any) => {
        if (val && typeof val === 'string' && !/^[a-z0-9-]+$/.test(val)) {
          return 'Slug must contain only lowercase letters, numbers, and hyphens';
        }
        return true;
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      label: 'Excerpt',
      admin: {
        description: 'Short description for post listing (max 200 characters)',
      },
      maxLength: 200,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
      label: 'Content',
      editor: slateEditor({}),
      admin: {
        description: 'Main post content with rich text formatting',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Featured Image',
      admin: {
        description: 'Main image for the post (recommended: 1200x630px)',
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
        description: 'Which site this post belongs to',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      label: 'Category',
      admin: {
        description: 'Primary category for this post',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: 'Tags',
      admin: {
        description: 'Tags for filtering and organizing content',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      label: 'Status',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        description: 'Draft posts are only visible to admins, published posts are public',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Published Date',
      admin: {
        description: 'Auto-set when first published, can be manually overridden',
        date: {
          displayFormat: 'dd/MM/yyyy HH:mm',
        },
      },
    },
    {
      type: 'group',
      name: 'seo',
      label: 'SEO Optimization',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          localized: true,
          label: 'Meta Title',
          admin: {
            description: 'SEO title (max 60 characters, defaults to post title)',
            placeholder: 'Leave empty to use post title',
          },
          maxLength: 60,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          localized: true,
          label: 'Meta Description',
          admin: {
            description: 'SEO description for search engines (max 160 characters)',
            placeholder: 'Compelling description for search results',
          },
          maxLength: 160,
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Open Graph Image',
          admin: {
            description: 'Image for social media sharing (recommended: 1200x630px)',
          },
        },
        {
          name: 'keywords',
          type: 'array',
          label: 'Keywords',
          admin: {
            description: 'SEO keywords for this post',
          },
          fields: [
            {
              name: 'keyword',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  ],
};
