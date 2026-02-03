export enum BillingPeriod {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  WEEKLY = 'weekly',
}

export class Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: BillingPeriod;
  createdAt: Date;
  updatedAt: Date;
}
