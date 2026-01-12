import { Pipe, PipeTransform } from '@angular/core';
import { Role, RoleUtils } from '../../role/role';

/**
 * Pipe pour obtenir la couleur d'un rôle
 * Usage: {{ user.role | roleColor }}
 */
@Pipe({
  name: 'roleColor',
  standalone: true
})
export class RoleColorPipe implements PipeTransform {
  transform(role: Role): string {
    return RoleUtils.getRoleColor(role);
  }
}
