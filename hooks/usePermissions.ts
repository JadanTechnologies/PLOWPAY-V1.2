import { useAppContext } from './useAppContext';
import { Permission } from '../types';

export const usePermissions = () => {
  const { currentAdminUser, adminRoles } = useAppContext();

  const hasPermission = (permission: Permission): boolean => {
    if (!currentAdminUser) {
      return false;
    }

    const userRole = adminRoles.find(role => role.id === currentAdminUser.roleId);

    if (!userRole) {
      return false;
    }
    
    // The 'Admin' role always has all permissions, regardless of the explicit list.
    if (userRole.name === 'Admin') {
        return true;
    }

    return userRole.permissions.includes(permission);
  };

  return { hasPermission };
};