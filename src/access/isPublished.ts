import { Access } from 'payload/types';

/**
 * Access control: Public API only sees published content
 * Authenticated admins see everything (drafts + published)
 * Unauthenticated users only see published content
 */
export const isPublished: Access = ({ req: { user } }: any) => {
  // Admins can see all content (drafts and published)
  if (user) {
    return true;
  }

  // Public API users only see published content
  return {
    status: {
      equals: 'published',
    },
  };
};
