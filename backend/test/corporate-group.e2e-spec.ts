import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('CorporateGroupController (e2e)', () => {
  let app: INestApplication<App>;
  let testGroup: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it.skip('/corporate-groups (POST) - should create a corporate group', async () => {
    const createDto = {
      name: 'E2E Corporate Group',
      description: 'E2E Test Description'
    };

    const res = await request(app.getHttpServer())
      .post('/corporate-groups')
      .set('x-tenant-id', 'public')
      .send(createDto)
      .expect(201);
      
    expect(res.body).toHaveProperty('id');
    testGroup = res.body;
  });

  it.skip('/corporate-groups (GET) - should return array of corporate groups', async () => {
    const res = await request(app.getHttpServer())
      .get('/corporate-groups')
      .set('x-tenant-id', 'public')
      .expect(200);
      
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});
