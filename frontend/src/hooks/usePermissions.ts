import { useState, useEffect } from 'react';
import { systemSettingsApi } from '../api/api';

interface UserPermissions {
  [key: string]: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const userPermissions = await systemSettingsApi.getUserPermissions();
        setPermissions(userPermissions);
      } catch (error) {
        console.error('Failed to fetch user permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const hasPermission = (module: string, action: 'view' | 'create' | 'edit' | 'delete') => {
    const modulePermissions = permissions[module];
    if (!modulePermissions) return false;

    switch (action) {
      case 'view': return modulePermissions.canView;
      case 'create': return modulePermissions.canCreate;
      case 'edit': return modulePermissions.canEdit;
      case 'delete': return modulePermissions.canDelete;
      default: return false;
    }
  };

  return { permissions, hasPermission, loading };
};