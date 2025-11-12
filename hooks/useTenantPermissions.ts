import { useMemo } from 'react';
import { useAppContext } from './useAppContext';
import { TenantPermission, allTenantPermissions } from '../types';

export const useTenantPermissions = () => {
  const { currentStaffUser, staffRoles } = useAppContext();

  const staffPermissions = useMemo(() => {
    // If not a staff user, it's a tenant admin, who has all permissions
    if (!currentStaffUser) {
        return new Set<TenantPermission>(allTenantPermissions);
    }

    const userRole = staffRoles.find(role => role.id === currentStaffUser.roleId);

    if (!userRole) {
      return new Set<TenantPermission>();
    }
    
    // The 'Admin' role also has all permissions
    if (userRole.name === 'Admin') {
        return new Set<TenantPermission>(allTenantPermissions);
    }

    return new Set(userRole.permissions);
  }, [currentStaffUser, staffRoles]);

  const hasTenantPermission = (permission: TenantPermission): boolean => {
    return staffPermissions.has(permission);
  };

  return { hasTenantPermission, staffPermissions };
};
