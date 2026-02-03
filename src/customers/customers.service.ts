import { Injectable } from '@nestjs/common';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CustomersService {
  private customers: Customer[] = [];

  create(createCustomerDto: CreateCustomerDto): Customer {
    const customer: Customer = {
      id: uuidv4(),
      ...createCustomerDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.customers.push(customer);
    return customer;
  }

  findAll(): Customer[] {
    return this.customers;
  }

  findOne(id: string): Customer | undefined {
    return this.customers.find((customer) => customer.id === id);
  }
}
