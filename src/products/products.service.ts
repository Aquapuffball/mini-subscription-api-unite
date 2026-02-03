import { Injectable } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductsService {
  private products: Product[] = [];

  create(createProductDto: CreateProductDto): Product {
    const product: Product = {
      id: uuidv4(),
      ...createProductDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.products.push(product);
    return product;
  }

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: string): Product | undefined {
    return this.products.find((product) => product.id === id);
  }
}
