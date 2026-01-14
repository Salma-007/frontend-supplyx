export enum ProductionOrderStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_PRODUCTION = 'EN_PRODUCTION',
  TERMINE = 'TERMINE',
  BLOQUE = 'BLOQUE'
}

export interface ProductionOrderRequest {
  quantity: number;
  startDate: string; // ISO date string
  endDate: string;
  productId: number;
  status?: ProductionOrderStatus;
}

export interface ProductionOrderResponse {
  id: number;
  quantity: number;
  status: ProductionOrderStatus;
  startDate: string;
  endDate: string;
  productId: number;
  productName: string;
}
