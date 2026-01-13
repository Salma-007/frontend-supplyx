
export interface DashboardStats {
  totalSuppliers: number;
  totalRawMaterials: number;
  criticalStockCount: number;
  ordersEnAttente: number;
  ordersEnCours: number;
  ordersRecues: number;
}


export interface DashboardRawData {
  suppliers: Supplier[];
  rawMaterials: RawMaterial[];
  orders: SupplyOrder[];
}


export interface Supplier {
  id: number;
  name: string;
  contact: string;
  rating: number;
  leadTime: number;
}


export interface RawMaterial {
  id: number;
  name: string;
  quantity: number;
  criticalThreshold: number;
  unit: string;
}


export enum OrderStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  RECUE = 'RECUE'
}


export interface SupplyOrder {
  id: number;
  supplierId: number;
  status: OrderStatus;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
}


export interface KpiCardData {
  title: string;
  value: number;
  icon: string;
  color: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  route: string;
  showBadge?: boolean;
  badgeText?: string;
}


export interface OrderStatusCardData {
  label: string;
  value: number;
  icon: string;
  color: 'pending' | 'progress' | 'completed';
  route: string;
}
