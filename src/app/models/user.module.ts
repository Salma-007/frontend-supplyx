import { Role } from '../role/role';

export interface UserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}


export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

export interface UserListItem extends UserResponse {
  fullName: string;
  roleLabel: string;
  roleColor: string;
}


export interface UserSearchFilters {
  searchTerm?: string;
  role?: Role;
  sortBy?: 'firstName' | 'lastName' | 'email' | 'role';
  sortOrder?: 'asc' | 'desc';
}

export class UserMapper {

  /**
   * Convertit UserResponse en UserListItem pour l'affichage
   */
  static toListItem(user: UserResponse): UserListItem {
    return {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      roleLabel: this.getRoleLabel(user.role),
      roleColor: this.getRoleColor(user.role)
    };
  }

  /**
   * Convertit plusieurs UserResponse en UserListItem
   */
  static toListItems(users: UserResponse[]): UserListItem[] {
    return users.map(user => this.toListItem(user));
  }

  /**
   * Obtient le nom complet d'un utilisateur
   */
  static getFullName(user: UserResponse): string {
    return `${user.firstName} ${user.lastName}`;
  }

  /**
   * Obtient les initiales d'un utilisateur
   */
  static getInitials(user: UserResponse): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  /**
   * Obtient le label du rôle
   */
  private static getRoleLabel(role: Role): string {
    const roleLabels: Record<Role, string> = {
      [Role.ADMIN]: 'Administrateur',
      [Role.GESTIONNAIRE_APPROVISIONNEMENT]: 'Gestionnaire Appro.',
      [Role.RESPONSABLE_ACHATS]: 'Resp. Achats',
      [Role.SUPERVISEUR_LOGISTIQUE]: 'Sup. Logistique',
      [Role.CHEF_PRODUCTION]: 'Chef Production',
      [Role.PLANIFICATEUR]: 'Planificateur',
      [Role.SUPERVISEUR_PRODUCTION]: 'Sup. Production',
      [Role.GESTIONNAIRE_COMMERCIAL]: 'Gest. Commercial',
      [Role.RESPONSABLE_LOGISTIQUE]: 'Resp. Logistique',
      [Role.SUPERVISEUR_LIVRAISONS]: 'Sup. Livraisons'
    };
    return roleLabels[role] || role;
  }

  /**
   * Obtient la couleur du badge de rôle
   */
  private static getRoleColor(role: Role): string {
    const colorMap: Record<Role, string> = {
      [Role.ADMIN]: 'danger',
      [Role.GESTIONNAIRE_APPROVISIONNEMENT]: 'primary',
      [Role.RESPONSABLE_ACHATS]: 'success',
      [Role.SUPERVISEUR_LOGISTIQUE]: 'info',
      [Role.CHEF_PRODUCTION]: 'warning',
      [Role.PLANIFICATEUR]: 'secondary',
      [Role.SUPERVISEUR_PRODUCTION]: 'primary',
      [Role.GESTIONNAIRE_COMMERCIAL]: 'success',
      [Role.RESPONSABLE_LOGISTIQUE]: 'info',
      [Role.SUPERVISEUR_LIVRAISONS]: 'warning'
    };
    return colorMap[role] || 'secondary';
  }
}
