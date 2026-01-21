export interface Customer {
  id: number;
  name: string;
  address: string;
  city: string;
}

export interface CustomerRequest {
  name: string;
  address: string;
  city: string;
}
