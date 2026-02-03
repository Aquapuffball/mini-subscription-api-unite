export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PENDING = 'pending',
}

export class Subscription {
  id: string;
  customerId: string;
  productId: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date | null;
  nextBillingDate: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
