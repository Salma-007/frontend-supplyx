
export enum Role {
  ADMIN = 'ADMIN',
  GESTIONNAIRE_APPROVISIONNEMENT = 'GESTIONNAIRE_APPROVISIONNEMENT',
  RESPONSABLE_ACHATS = 'RESPONSABLE_ACHATS',
  SUPERVISEUR_LOGISTIQUE = 'SUPERVISEUR_LOGISTIQUE',
  CHEF_PRODUCTION = 'CHEF_PRODUCTION',
  PLANIFICATEUR = 'PLANIFICATEUR',
  SUPERVISEUR_PRODUCTION = 'SUPERVISEUR_PRODUCTION',
  GESTIONNAIRE_COMMERCIAL = 'GESTIONNAIRE_COMMERCIAL',
  RESPONSABLE_LOGISTIQUE = 'RESPONSABLE_LOGISTIQUE',
  SUPERVISEUR_LIVRAISONS = 'SUPERVISEUR_LIVRAISONS'
}


export interface RoleInfo {
  value: Role;
  label: string;
  description: string;
  color: string;
  icon: string;
}

export class RoleUtils {

  private static readonly ROLE_INFO_MAP: Record<Role, Omit<RoleInfo, 'value'>> = {
    [Role.ADMIN]: {
      label: 'Administrateur',
      description: 'Accès complet au système',
      color: 'danger',
      icon: 'user-shield'
    },
    [Role.GESTIONNAIRE_APPROVISIONNEMENT]: {
      label: 'Gestionnaire Approvisionnement',
      description: 'Gestion des approvisionnements',
      color: 'primary',
      icon: 'boxes'
    },
    [Role.RESPONSABLE_ACHATS]: {
      label: 'Responsable Achats',
      description: 'Gestion des achats',
      color: 'success',
      icon: 'shopping-cart'
    },
    [Role.SUPERVISEUR_LOGISTIQUE]: {
      label: 'Superviseur Logistique',
      description: 'Supervision logistique',
      color: 'info',
      icon: 'truck'
    },
    [Role.CHEF_PRODUCTION]: {
      label: 'Chef Production',
      description: 'Direction de la production',
      color: 'warning',
      icon: 'industry'
    },
    [Role.PLANIFICATEUR]: {
      label: 'Planificateur',
      description: 'Planification des opérations',
      color: 'secondary',
      icon: 'calendar-alt'
    },
    [Role.SUPERVISEUR_PRODUCTION]: {
      label: 'Superviseur Production',
      description: 'Supervision de la production',
      color: 'primary',
      icon: 'tasks'
    },
    [Role.GESTIONNAIRE_COMMERCIAL]: {
      label: 'Gestionnaire Commercial',
      description: 'Gestion commerciale',
      color: 'success',
      icon: 'chart-line'
    },
    [Role.RESPONSABLE_LOGISTIQUE]: {
      label: 'Responsable Logistique',
      description: 'Responsable de la logistique',
      color: 'info',
      icon: 'shipping-fast'
    },
    [Role.SUPERVISEUR_LIVRAISONS]: {
      label: 'Superviseur Livraisons',
      description: 'Supervision des livraisons',
      color: 'warning',
      icon: 'dolly'
    }
  };


  static getRoleInfo(role: Role): RoleInfo {
    const info = this.ROLE_INFO_MAP[role];
    return {
      value: role,
      ...info
    };
  }


  static getRoleLabel(role: Role): string {
    return this.ROLE_INFO_MAP[role]?.label || role;
  }


  static getRoleColor(role: Role): string {
    return this.ROLE_INFO_MAP[role]?.color || 'secondary';
  }

  static getRoleIcon(role: Role): string {
    return this.ROLE_INFO_MAP[role]?.icon || 'user';
  }


  static getAllRoles(): RoleInfo[] {
    return Object.values(Role).map(role => this.getRoleInfo(role));
  }


  static getRolesForSelect(): Array<{value: Role, label: string}> {
    return Object.values(Role).map(role => ({
      value: role,
      label: this.getRoleLabel(role)
    }));
  }


  static hasRole(userRole: Role, requiredRole: Role): boolean {
    return userRole === requiredRole;
  }


  static hasAnyRole(userRole: Role, requiredRoles: Role[]): boolean {
    return requiredRoles.includes(userRole);
  }


  static isAdminRole(role: Role): boolean {
    return role === Role.ADMIN;
  }
}
