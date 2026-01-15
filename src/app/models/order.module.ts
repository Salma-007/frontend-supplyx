export enum OrderStatus {
  EN_PREPARATION = 'EN_PREPARATION',
  EN_ROUTE = 'EN_ROUTE',
  LIVREE = 'LIVREE',
  ANNULEE = 'ANNULEE'
}

export interface OrderRequest {
  productId: number;
  customerId: number;
  quantity: number;
}

export interface OrderResponse {
  id: number;
  productId: number;
  productName: string;
  customerId: number;
  customerName: string;
  quantity: number;
  status: OrderStatus;
}
