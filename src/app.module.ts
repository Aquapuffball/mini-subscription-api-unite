import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from './customers/customers.module';
import { ProductsModule } from './products/products.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, CustomersModule, ProductsModule, SubscriptionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
