export interface RawMaterialRequest {
  name: string;
  stock: number;
  stockMin: number;
  unit: string;
  supplierIds: number[];
}

export interface RawMaterialResponse {
  id: number;
  name: string;
  stock: number;
  stockMin: number;
  unit: string;
  suppliers: any[]; 
}