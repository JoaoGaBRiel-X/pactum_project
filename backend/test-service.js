const { PrismaClient } = require('@prisma/client');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { CustomerService } = require('./dist/modules/customer/customer.service');
const { AsyncLocalStorage } = require('async_hooks');
const { TenantContext } = require('./dist/tenant/tenant-context'); // or whatever

async function testCreate() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // Actually, setting up the tenant context is hard this way.
  // Let's just use Prisma directly with a raw query or manually set search_path
}
testCreate();
