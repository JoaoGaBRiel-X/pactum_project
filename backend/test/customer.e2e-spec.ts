import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TenantPrismaService } from '../src/tenant/tenant-prisma.service';

describe('CustomerController (e2e)', () => {
  let app: INestApplication<App>;
  let tenantPrisma: any;
  let testCustomer: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    // For E2E tests, we will mock the tenant context or use a default one.
    // Assuming x-tenant-id is required for multi-tenant middleware
    const prisma = moduleFixture.get<PrismaService>(PrismaService);
    // Note: Since this is schema-per-tenant, we might need a test tenant.
    // For simplicity, we just use a generic token or mock the tenant middleware if it fails.
  });

  afterAll(async () => {
    await app.close();
  });

  // We are skipping this by default unless a test DB is properly seeded for E2E
  it.skip('/customers (POST) - should create a customer', async () => {
    const createDto = {
      document: '99999999999999',
      corporateName: 'E2E Test Corp',
      contacts: [{ name: 'Test Contact', email: 'e2e@test.com' }]
    };

    const res = await request(app.getHttpServer())
      .post('/customers')
      .set('x-tenant-id', 'public') // or test tenant
      .send(createDto)
      .expect(201);
      
    expect(res.body).toHaveProperty('id');
    testCustomer = res.body;
  });

  it.skip('/customers (GET) - should return array of customers', async () => {
    const res = await request(app.getHttpServer())
      .get('/customers')
      .set('x-tenant-id', 'public')
      .expect(200);
      
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});
