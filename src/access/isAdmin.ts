import { Access } from 'payload/types';

/**
 * Access control: Only admin users have access
 * Used for sensitive operations and admin-only content
 */
export const isAdmin: Access = ({ req: { user } }: any) => {
  // Check if user is authenticated and has admin role
  if (user && user.roles?.includes('admin')) {
    return true;
  }

  return false;
};
