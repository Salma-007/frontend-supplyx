import {SupplyOrderStatus, SupplyOrderStatusUtils} from '../enums/supply-order-status';

/**
 * Interface pour un item de commande (SupplyOrderItem)
 */
export interface SupplyOrderItem {
  materialId: number;
  quantity: number;
}

/**
 * Interface pour la requête de création de commande
 * Correspond à SupplyOrderRequestDTO
 */
export interface SupplyOrderRequest {
  supplierId: number;
  orderItems: SupplyOrderItem[];
}

/**
 * Interface pour un item dans la réponse
 * Correspond à SupplyOrderItemResponseDTO
 */
export interface SupplyOrderItemResponse {
  id: number;
  materialId: number;
  materialName: string;
  quantity: number;
}

/**
 * Interface pour la réponse de commande
 * Correspond à SupplyOrderResponseDTO
 */
export interface SupplyOrderResponse {
  id: number;
  orderdate: string; // LocalDate devient string en JSON
  supplierId: number;
  status: SupplyOrderStatus;
  orderItems: SupplyOrderItemResponse[];
}

/**
 * Interface étendue pour l'affichage dans la liste
 */
export interface SupplyOrderListItem extends SupplyOrderResponse {
  supplierName?: string;
  totalItems: number;
  totalQuantity: number;
  statusLabel: string;
  statusColor: string;
  canChangeStatus: boolean;
}

/**
 * Interface pour les filtres de recherche
 */
export interface SupplyOrderSearchFilters {
  searchTerm?: string;
  status?: SupplyOrderStatus;
  supplierId?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'orderdate' | 'status' | 'supplierId';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface pour un item de matière première dans le formulaire
 */
export interface OrderFormItem {
  materialId: number;
  materialName: string;
  quantity: number;
  availableStock?: number;
  unit?: string;
}

/**
 * Classe utilitaire pour manipuler les données de commande
 */
export class SupplyOrderMapper {

  /**
   * Convertit SupplyOrderResponse en SupplyOrderListItem
   */
  static toListItem(
    order: SupplyOrderResponse,
    supplierName?: string
  ): SupplyOrderListItem {
    const totalItems = order.orderItems.length;
    const totalQuantity = order.orderItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return {
      ...order,
      supplierName,
      totalItems,
      totalQuantity,
      statusLabel: SupplyOrderStatusUtils.getStatusLabel(order.status),
      statusColor: SupplyOrderStatusUtils.getStatusColor(order.status),
      canChangeStatus: SupplyOrderStatusUtils.canChangeStatus(order.status)
    };
  }

  /**
   * Convertit plusieurs commandes en liste d'affichage
   */
  static toListItems(
    orders: SupplyOrderResponse[],
    suppliersMap?: Map<number, string>
  ): SupplyOrderListItem[] {
    return orders.map(order => {
      const supplierName = suppliersMap?.get(order.supplierId);
      return this.toListItem(order, supplierName);
    });
  }

  /**
   * Formate la date pour l'affichage
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Calcule le montant total d'une commande (si prix disponibles)
   */
  static calculateTotal(items: SupplyOrderItemResponse[], pricesMap?: Map<number, number>): number {
    if (!pricesMap) return 0;

    return items.reduce((total, item) => {
      const price = pricesMap.get(item.materialId) || 0;
      return total + (price * item.quantity);
    }, 0);
  }
}
