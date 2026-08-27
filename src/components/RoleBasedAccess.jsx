import React from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../config/roles';

/**
 * Composant pour contrôler l'accès aux fonctionnalités basé sur les rôles
 * @param {Array} allowedRoles - Rôles autorisés
 * @param {Array} requiredPermissions - Permissions requises (ET)
 * @param {Array} anyPermissions - Au moins une permission requise (OU)
 * @param {ReactNode} children - Contenu à afficher si accès autorisé
 * @param {ReactNode} fallback - Contenu à afficher si accès refusé
 */
export const RoleBasedAccess = ({
  allowedRoles = [],
  requiredPermissions = [],
  anyPermissions = [],
  children,
  fallback = null
}) => {
  const { user } = useAuth();

  if (!user) {
    return fallback;
  }

  // Vérifier les rôles
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return fallback;
  }

  // Vérifier les permissions requises (ET)
  if (requiredPermissions.length > 0) {
    if (!hasAllPermissions(user.role, requiredPermissions)) {
      return fallback;
    }
  }

  // Vérifier les permissions optionnelles (OU)
  if (anyPermissions.length > 0) {
    if (!hasAnyPermission(user.role, anyPermissions)) {
      return fallback;
    }
  }

  return children;
};

/**
 * Hook pour vérifier les permissions
 */
export const usePermission = (permission) => {
  const { user } = useAuth();
  if (!user) return false;
  return hasPermission(user.role, permission);
};

/**
 * Hook pour vérifier les rôles
 */
export const useRole = (role) => {
  const { user } = useAuth();
  if (!user) return false;
  return user.role === role;
};

/**
 * Hook pour vérifier plusieurs rôles
 */
export const useHasAnyRole = (roles) => {
  const { user } = useAuth();
  if (!user) return false;
  return roles.includes(user.role);
};

/**
 * Composant button avec contrôle d'accès
 */
export const PermissionButton = ({
  permission,
  requiredPermissions = [],
  anyPermissions = [],
  allowedRoles = [],
  children,
  disabled = false,
  ...buttonProps
}) => {
  const { user } = useAuth();

  if (!user) return null;

  let isDisabled = disabled;

  if (allowedRoles.length > 0) {
    isDisabled ||= !allowedRoles.includes(user.role);
  }

  if (permission) {
    isDisabled ||= !hasPermission(user.role, permission);
  }

  if (requiredPermissions.length > 0) {
    isDisabled ||= !hasAllPermissions(user.role, requiredPermissions);
  }

  if (anyPermissions.length > 0) {
    isDisabled ||= !hasAnyPermission(user.role, anyPermissions);
  }

  return (
    <button {...buttonProps} disabled={isDisabled}>
      {children}
    </button>
  );
};

export default RoleBasedAccess;
