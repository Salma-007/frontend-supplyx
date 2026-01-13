import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupplyOrderStatus, SupplyOrderStatusUtils } from '../../../../enums/supply-order-status';

/**
 * Composant réutilisable pour afficher un badge de statut de commande
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.css']
})
export class StatusBadgeComponent {
  @Input() status!: SupplyOrderStatus;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showIcon: boolean = true;

  get statusInfo() {
    return SupplyOrderStatusUtils.getStatusInfo(this.status);
  }

  get badgeClass(): string {
    return `badge-${this.size} badge-${this.statusInfo.color}`;
  }
}
