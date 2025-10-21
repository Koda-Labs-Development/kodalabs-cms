import { CollectionConfig } from 'payload/types';
import { isAdmin } from '../access';
import path from 'path';

/**
 * Media Collection - File Uploads
 * Manages images, documents, and other uploaded files
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize'],
    group: 'Media',
  },
  access: {
    create: isAdmin,
    read: () => true, // Public can access media files
    update: isAdmin,
    delete: isAdmin,
  },
  upload: {
    staticDir: path.resolve(__dirname, '../../public/media'),
    mimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'application/pdf',
    ],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 80,
          },
        },
      },
      {
        name: 'medium',
        width: 800,
        height: 600,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 85,
          },
        },
      },
      {
        name: 'large',
        width: 1200,
        height: 900,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 90,
          },
        },
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 90,
          },
        },
      },
    ],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    crop: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      label: 'Alt Text',
      admin: {
        description: 'Alternative text for accessibility and SEO (describe the image)',
      },
    },
    {
      name: 'caption',
      type: 'textarea',
      localized: true,
      label: 'Caption',
      admin: {
        description: 'Optional caption to display with the image',
      },
      maxLength: 300,
    },
  ],
};
