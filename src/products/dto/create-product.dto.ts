import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsPositive,
} from 'class-validator';
import { BillingPeriod } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsEnum(BillingPeriod)
  billingPeriod: BillingPeriod;
}
