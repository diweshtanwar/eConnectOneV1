import { useState, useEffect } from 'react';
import { systemSettingsApi } from '../api/api';
import { useAuth } from '../contexts/AuthContext';

interface UserPermissions {
  [key: string]: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
}

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip the request entirely when there's no authenticated user (e.g. on the
    // login page, or before AuthContext has finished restoring the session).
    // Without this guard, the request fires unconditionally on mount with no
    // token, resulting in a 401 from the API on every unauthenticated page load.
    if (!user) {
      setPermissions({});
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchPermissions = async () => {
      setLoading(true);
      try {
        const userPermissions = await systemSettingsApi.getUserPermissions();
        if (!cancelled) {
          setPermissions(userPermissions);
        }
      } catch (error) {
        console.error('Failed to fetch user permissions:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPermissions();

    return () => {
      cancelled = true;
    };
  }, [user]);

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