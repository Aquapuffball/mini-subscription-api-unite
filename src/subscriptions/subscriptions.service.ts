import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  Subscription,
  SubscriptionStatus,
} from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CustomersService } from '../customers/customers.service';
import { ProductsService } from '../products/products.service';
import { BillingPeriod } from '../products/entities/product.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SubscriptionsService {
  private subscriptions: Subscription[] = [];

  constructor(
    private readonly customersService: CustomersService,
    private readonly productsService: ProductsService,
  ) {}

  create(createSubscriptionDto: CreateSubscriptionDto): Subscription {
    const customer = this.customersService.findOne(
      createSubscriptionDto.customerId,
    );
    if (!customer) {
      throw new NotFoundException(
        `Customer with ID ${createSubscriptionDto.customerId} not found`,
      );
    }

    const product = this.productsService.findOne(
      createSubscriptionDto.productId,
    );
    if (!product) {
      throw new NotFoundException(
        `Product with ID ${createSubscriptionDto.productId} not found`,
      );
    }

    const existingSubscription = this.subscriptions.find(
      (sub) =>
        sub.customerId === createSubscriptionDto.customerId &&
        sub.productId === createSubscriptionDto.productId &&
        sub.status === SubscriptionStatus.ACTIVE,
    );
    if (existingSubscription) {
      throw new BadRequestException(
        'Customer already has an active subscription to this product',
      );
    }

    const nextBillingDate = this.calculateNextBillingDate(
      product.billingPeriod,
    );

    const subscription: Subscription = {
      id: uuidv4(),
      customerId: createSubscriptionDto.customerId,
      productId: createSubscriptionDto.productId,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      endDate: null,
      nextBillingDate,
      cancelledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.subscriptions.push(subscription);
    return subscription;
  }

  findAll(): Subscription[] {
    return this.subscriptions;
  }

  findOne(id: string): Subscription | undefined {
    return this.subscriptions.find((subscription) => subscription.id === id);
  }

  findByCustomerId(customerId: string): Subscription[] {
    return this.subscriptions.filter(
      (subscription) => subscription.customerId === customerId,
    );
  }

  findByProductId(productId: string): Subscription[] {
    return this.subscriptions.filter(
      (subscription) => subscription.productId === productId,
    );
  }

  cancel(id: string): Subscription {
    const subscription = this.findOne(id);
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    // only active or pending subscriptions can be cancelled, expired or already cancelled subscriptions can't be cancelled
    if (
      subscription.status != SubscriptionStatus.ACTIVE &&
      subscription.status != SubscriptionStatus.PENDING
    ) {
      throw new BadRequestException('Subscription is not active or pending');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.endDate = subscription.nextBillingDate;
    subscription.cancelledAt = new Date();
    subscription.updatedAt = new Date();

    return subscription;
  }

  private calculateNextBillingDate(billingPeriod: BillingPeriod): Date {
    const nextDate = new Date();

    switch (billingPeriod) {
      case BillingPeriod.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case BillingPeriod.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case BillingPeriod.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate;
  }
}
