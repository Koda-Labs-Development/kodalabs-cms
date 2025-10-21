import { CollectionConfig } from 'payload/types';
import { isAdmin } from '../access';

/**
 * Users Collection - Admin Authentication
 * Manages CMS admin users with role-based access control
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'roles'],
    group: 'Admin',
  },
  access: {
    // Only admins can manage users
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
      admin: {
        description: 'First name of the user',
      },
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
      admin: {
        description: 'Last name of the user',
      },
    },
    {
      name: 'roles',
      type: 'select',
      required: true,
      defaultValue: ['editor'],
      hasMany: true,
      label: 'Roles',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      admin: {
        description: 'Admin: Full access, Editor: Can create/edit content but not manage users or sites',
      },
    },
  ],
};
