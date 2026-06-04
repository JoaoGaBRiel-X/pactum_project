import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';
import { PrismaService } from '../../prisma/prisma.service';

// Mocking nodemailer
jest.mock('nodemailer', () => ({
  createTestAccount: jest.fn().mockResolvedValue({
    smtp: { host: 'smtp.ethereal.email', port: 587, secure: false },
    user: 'test_user',
    pass: 'test_pass',
  }),
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: '123' }),
  }),
  getTestMessageUrl: jest.fn().mockReturnValue('http://testurl.com'),
}));

describe('NotificationService', () => {
  let service: NotificationService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      notificationTemplate: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: TENANT_PRISMA_SERVICE, useValue: mockPrisma },
        { provide: PrismaService, useValue: { client: { tenant: { findUnique: jest.fn().mockResolvedValue({ schema: 'tenant_test' }) } } } },
        { provide: 'BullQueue_email', useValue: { add: jest.fn() } },
        { provide: 'REQUEST', useValue: { headers: { 'x-tenant-id': 'tenant-1' } } },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    // await initialization
    await new Promise(resolve => setTimeout(resolve, 50)); 
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendNotification', () => {
    it('should abort if template is not found', async () => {
      mockPrisma.notificationTemplate.findUnique.mockResolvedValue(null);
      const result = await service.sendNotification('NOT_FOUND', 'test@test.com', {});
      expect(result).toBeNull();
    });

    it('should abort if template is inactive', async () => {
      mockPrisma.notificationTemplate.findUnique.mockResolvedValue({ isActive: false });
      const result = await service.sendNotification('INACTIVE', 'test@test.com', {});
      expect(result).toBeNull();
    });

    it('should push notification to queue successfully', async () => {
      mockPrisma.notificationTemplate.findUnique.mockResolvedValue({
        isActive: true,
      });

      const result = await service.sendNotification('VALID_TEMPLATE', 'test@test.com', {
        customer: { name: 'João' },
      });

      expect(result).toEqual({ success: true, message: 'Enfileirado com sucesso' });
      // Assert that queue.add was called
      const emailQueue = (service as any).emailQueue;
      expect(emailQueue.add).toHaveBeenCalledWith('send-notification', expect.objectContaining({
        templateName: 'VALID_TEMPLATE',
        toEmail: 'test@test.com',
        tenantSchema: 'tenant_test',
      }), expect.any(Object));
    });
  });
});
