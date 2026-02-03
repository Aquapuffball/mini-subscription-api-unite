import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Subscription API (e2e)', () => {
  let app: INestApplication<App>;
  let customerId: string;
  let productId: string;
  let subscriptionId: string;
  const API_KEY = 'test-api-key-12345';

  beforeAll(async () => {
    // Set API key for tests
    process.env.API_KEY = API_KEY;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authorization', () => {
    it('GET / ', () => {
      return request(app.getHttpServer())
        .get('/')
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(200);
    });

    it('GET / - should reject invalid API key', () => {
      return request(app.getHttpServer())
        .get('/')
        .set('Authorization', `Bearer invalid-key`)
        .expect(401);
    });

    it('GET / - should reject no API key', () => {
      return request(app.getHttpServer()).get('/').expect(401);
    });
  });

  describe('Customers', () => {
    it('POST /customers - should create a customer', () => {
      return request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('john.doe@example.com');
          expect(res.body.firstName).toBe('John');
          expect(res.body.lastName).toBe('Doe');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
          customerId = res.body.id;
        });
    });

    it('POST /customers - should validate email format', () => {
      return request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          email: 'invalid-email',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(400);
    });

    it('POST /customers - should require all fields', () => {
      return request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          email: 'john.doe@example.com',
        })
        .expect(400);
    });

    it('GET /customers - should return all customers', () => {
      return request(app.getHttpServer())
        .get('/customers')
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('email');
        });
    });

    it('GET /customers/:id - should return a specific customer', () => {
      return request(app.getHttpServer())
        .get(`/customers/${customerId}`)
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(customerId);
          expect(res.body.email).toBe('john.doe@example.com');
        });
    });

    it('GET /customers/:id - should return 404 for non-existent customer', () => {
      return request(app.getHttpServer())
        .get('/customers/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(404);
    });
  });

  describe('Products', () => {
    it('POST /products - should create a product', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          name: 'Premium Plan',
          description: 'Monthly premium subscription with all features',
          price: 29.99,
          currency: 'USD',
          billingPeriod: 'monthly',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Premium Plan');
          expect(res.body.price).toBe(29.99);
          expect(res.body.currency).toBe('USD');
          expect(res.body.billingPeriod).toBe('monthly');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
          productId = res.body.id;
        });
    });

    it('POST /products - should validate billing period enum', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          name: 'Test Plan',
          description: 'Test description',
          price: 19.99,
          currency: 'USD',
          billingPeriod: 'invalid',
        })
        .expect(400);
    });

    it('POST /products - should validate positive price', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          name: 'Test Plan',
          description: 'Test description',
          price: -10,
          currency: 'USD',
          billingPeriod: 'monthly',
        })
        .expect(400);
    });

    it('GET /products - should return all products', () => {
      return request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
        });
    });

    it('GET /products/:id - should return a specific product', () => {
      return request(app.getHttpServer())
        .get(`/products/${productId}`)
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(productId);
          expect(res.body.name).toBe('Premium Plan');
        });
    });

    it('GET /products/:id - should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/products/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(404);
    });
  });

  describe('Subscriptions', () => {
    it('POST /subscriptions - should create a subscription', () => {
      return request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          customerId: customerId,
          productId: productId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.customerId).toBe(customerId);
          expect(res.body.productId).toBe(productId);
          expect(res.body.status).toBe('active');
          expect(res.body).toHaveProperty('startDate');
          expect(res.body).toHaveProperty('nextBillingDate');
          expect(res.body.endDate).toBeNull();
          subscriptionId = res.body.id;
        });
    });

    it('POST /subscriptions - should validate UUID format', () => {
      return request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          customerId: 'invalid-uuid',
          productId: productId,
        })
        .expect(400);
    });

    it('POST /subscriptions - should return 404 for non-existent customer', () => {
      return request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          customerId: '00000000-0000-0000-0000-000000000000',
          productId: productId,
        })
        .expect(404);
    });

    it('POST /subscriptions - should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          customerId: customerId,
          productId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(404);
    });

    it('POST /subscriptions - should prevent duplicate active subscriptions', () => {
      return request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          customerId: customerId,
          productId: productId,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            'already has an active subscription',
          );
        });
    });

    it('GET /subscriptions - should return all subscriptions', () => {
      return request(app.getHttpServer())
        .get('/subscriptions')
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('customerId');
          expect(res.body[0]).toHaveProperty('productId');
        });
    });

    it('GET /subscriptions/:id - should return a specific subscription', () => {
      return request(app.getHttpServer())
        .get(`/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(subscriptionId);
          expect(res.body.customerId).toBe(customerId);
          expect(res.body.productId).toBe(productId);
        });
    });

    it('GET /subscriptions/customer/:customerId - should return subscriptions for a customer', () => {
      return request(app.getHttpServer())
        .get(`/subscriptions/customer/${customerId}`)
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(
            res.body.every((sub: any) => sub.customerId === customerId),
          ).toBe(true);
        });
    });

    it('GET /subscriptions/product/:productId - should return subscriptions for a product', () => {
      return request(app.getHttpServer())
        .get(`/subscriptions/product/${productId}`)
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(
            res.body.every((sub: any) => sub.productId === productId),
          ).toBe(true);
        });
    });

    it('PATCH /subscriptions/:id/cancel - should cancel a subscription', () => {
      return request(app.getHttpServer())
        .patch(`/subscriptions/${subscriptionId}/cancel`)
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(subscriptionId);
          expect(res.body.status).toBe('cancelled');
          expect(res.body).toHaveProperty('endDate');
          expect(res.body.endDate).not.toBeNull();
          expect(res.body).toHaveProperty('cancelledAt');
          expect(res.body.cancelledAt).not.toBeNull();
        });
    });

    it('PATCH /subscriptions/:id/cancel - should not allow cancelling already cancelled subscription', () => {
      return request(app.getHttpServer())
        .patch(`/subscriptions/${subscriptionId}/cancel`)
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('not active or pending');
        });
    });

    it('PATCH /subscriptions/:id/cancel - should return 404 for non-existent subscription', () => {
      return request(app.getHttpServer())
        .patch('/subscriptions/00000000-0000-0000-0000-000000000000/cancel')
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(404);
    });
  });
});
