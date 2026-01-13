export enum SupplyOrderStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  RECUE = 'RECUE'
}


export interface StatusInfo {
  value: SupplyOrderStatus;
  label: string;
  description: string;
  color: string;
  icon: string;
}


export class SupplyOrderStatusUtils {


  private static readonly STATUS_INFO_MAP: Record<SupplyOrderStatus, Omit<StatusInfo, 'value'>> = {
    [SupplyOrderStatus.EN_ATTENTE]: {
      label: 'En Attente',
      description: 'Commande créée, en attente de traitement',
      color: 'warning',
      icon: 'clock'
    },
    [SupplyOrderStatus.EN_COURS]: {
      label: 'En Cours',
      description: 'Commande en cours de livraison',
      color: 'info',
      icon: 'shipping-fast'
    },
    [SupplyOrderStatus.RECUE]: {
      label: 'Reçue',
      description: 'Commande reçue et stock mis à jour',
      color: 'success',
      icon: 'check-circle'
    }
  };

  static getStatusInfo(status: SupplyOrderStatus): StatusInfo {
    const info = this.STATUS_INFO_MAP[status];
    return {
      value: status,
      ...info
    };
  }

  static getStatusLabel(status: SupplyOrderStatus): string {
    return this.STATUS_INFO_MAP[status]?.label || status;
  }

  static getStatusColor(status: SupplyOrderStatus): string {
    return this.STATUS_INFO_MAP[status]?.color || 'secondary';
  }


  static getStatusIcon(status: SupplyOrderStatus): string {
    return this.STATUS_INFO_MAP[status]?.icon || 'question';
  }


  static getAllStatuses(): StatusInfo[] {
    return Object.values(SupplyOrderStatus).map(status => this.getStatusInfo(status));
  }


  static getStatusesForSelect(): Array<{value: SupplyOrderStatus, label: string}> {
    return Object.values(SupplyOrderStatus).map(status => ({
      value: status,
      label: this.getStatusLabel(status)
    }));
  }


  static canChangeStatus(currentStatus: SupplyOrderStatus): boolean {
    return currentStatus !== SupplyOrderStatus.RECUE;
  }


  static getNextPossibleStatuses(currentStatus: SupplyOrderStatus): SupplyOrderStatus[] {
    switch (currentStatus) {
      case SupplyOrderStatus.EN_ATTENTE:
        return [SupplyOrderStatus.EN_COURS, SupplyOrderStatus.RECUE];
      case SupplyOrderStatus.EN_COURS:
        return [SupplyOrderStatus.RECUE];
      case SupplyOrderStatus.RECUE:
        return []; // Pas de changement possible
      default:
        return [];
    }
  }
}
