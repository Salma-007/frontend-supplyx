import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role, RoleUtils } from '../../../role/role';

/**
 * Composant réutilisable pour afficher un badge de rôle
 */
@Component({
  selector: 'app-role-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-badge.component.html',
  styleUrls: ['./role-badge.component.css']
})
export class RoleBadgeComponent {
  @Input() role!: Role;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showIcon: boolean = true;

  get roleInfo() {
    return RoleUtils.getRoleInfo(this.role);
  }

  get badgeClass(): string {
    return `badge-${this.size} badge-${this.roleInfo.color}`;
  }
}
