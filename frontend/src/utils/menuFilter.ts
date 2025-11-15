import { MenuItem } from '../constants/menuConfig';

interface UserPermissions {
  [key: string]: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
}

interface User {
  roleName?: string;
  role?: {
    name: string;
  };
}

/**
 * Filter menu items based on user permissions and role
 */
export const filterMenuByPermissions = (
  menuItems: MenuItem[],
  user: User | null,
  permissions: UserPermissions
): MenuItem[] => {
  if (!user) return [];

  const userRole = user.roleName || user.role?.name;

  // Master Admin and Admin get all pages
  if (userRole === 'Master Admin' || userRole === 'Admin') {
    return menuItems;
  }

  return menuItems.filter(item => {
    // Check DB permission first (preferred)
    if (item.permission) {
      const perm = permissions[item.permission];
      // If permission exists in DB, use it
      if (perm !== undefined) {
        return perm.canView === true;
      }
      // If no DB permission, fallback to roles if defined
      if (item.roles && userRole) {
        return item.roles.includes(userRole);
      }
      // No DB permission and no roles = hide
      return false;
    }
    
    // Role-based check only
    if (item.roles && userRole) {
      return item.roles.includes(userRole);
    }
    
    // Default: show if no restrictions
    return true;
  });
};
