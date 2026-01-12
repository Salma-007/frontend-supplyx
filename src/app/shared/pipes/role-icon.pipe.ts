import { Pipe, PipeTransform } from '@angular/core';
import { Role, RoleUtils } from '../../role/role';

/**
 * Pipe pour obtenir l'icône d'un rôle
 * Usage: {{ user.role | roleIcon }}
 */
@Pipe({
  name: 'roleIcon',
  standalone: true
})
export class RoleIconPipe implements PipeTransform {
  transform(role: Role): string {
    return RoleUtils.getRoleIcon(role);
  }
}
