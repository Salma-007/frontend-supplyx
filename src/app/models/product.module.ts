
export interface BillOfMaterialRequest {
  rawMaterialId: number;
  quantity: number;
}

export interface BillOfMaterialResponse {
  id: number;
  rawMaterialId: number;
  rawMaterialName: string;
  quantity: number;
}

export interface ProductRequest {
  name: string;
  productionTime: number;
  cost: number;
  stock: number;
  bills: BillOfMaterialRequest[];
}

export interface ProductResponse {
  id: number;
  name: string;
  productionTime: number;
  cost: number;
  stock: number;
  bills: BillOfMaterialResponse[];
}
