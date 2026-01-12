
export interface DashboardStats {
  totalSuppliers: number;
  totalRawMaterials: number;
  criticalStockCount: number;
  ordersEnAttente: number;
  ordersEnCours: number;
  ordersRecues: number;
}

/**
 * Interface pour les données brutes de l'API
 */
export interface DashboardRawData {
  suppliers: Supplier[];
  rawMaterials: RawMaterial[];
  orders: SupplyOrder[];
}

/**
 * Interface Supplier (Fournisseur)
 */
export interface Supplier {
  id: number;
  name: string;
  contact: string;
  rating: number;
  leadTime: number;
}

/**
 * Interface RawMaterial (Matière Première)
 */
export interface RawMaterial {
  id: number;
  name: string;
  quantity: number;
  criticalThreshold: number;
  unit: string;
}

/**
 * Enum pour le statut des commandes
 */
export enum OrderStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  RECUE = 'RECUE'
}

/**
 * Interface SupplyOrder (Commande d'approvisionnement)
 */
export interface SupplyOrder {
  id: number;
  supplierId: number;
  status: OrderStatus;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
}

/**
 * Interface pour les cartes KPI
 */
export interface KpiCardData {
  title: string;
  value: number;
  icon: string;
  color: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  route: string;
  showBadge?: boolean;
  badgeText?: string;
}

/**
 * Interface pour les cartes de statut de commande
 */
export interface OrderStatusCardData {
  label: string;
  value: number;
  icon: string;
  color: 'pending' | 'progress' | 'completed';
  route: string;
}
