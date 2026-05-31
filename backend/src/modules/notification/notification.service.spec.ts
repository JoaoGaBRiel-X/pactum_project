import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';

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
        {
          provide: TENANT_PRISMA_SERVICE,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    // await initialization
    await new Promise(resolve => setTimeout(resolve, 50)); 
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('replaceVariables', () => {
    it('should replace variables correctly', () => {
      // Testing private method logic via public usage or bypassing TS
      const text = 'Hello {{customer.corporateName}}, you owe {{receivable.amount}}';
      const data = {
        customer: { corporateName: 'Test Corp' },
        receivable: { amount: 500 },
      };
      const result = (service as any).replaceVariables(text, data);
      expect(result).toBe('Hello Test Corp, you owe 500');
    });

    it('should leave missing variables intact', () => {
      const text = 'Hello {{missing.field}}';
      const data = {};
      const result = (service as any).replaceVariables(text, data);
      expect(result).toBe('Hello {{missing.field}}');
    });
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

    it('should send email successfully', async () => {
      mockPrisma.notificationTemplate.findUnique.mockResolvedValue({
        isActive: true,
        subject: 'Subject {{customer.name}}',
        content: 'Content {{receivable.amount}}',
      });

      const result = await service.sendNotification('VALID_TEMPLATE', 'test@test.com', {
        customer: { name: 'João' },
        receivable: { amount: 150 },
      });

      expect(result).toEqual({ messageId: '123' });
      // Assert that transporter.sendMail was called with replaced variables
      expect((service as any).transporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@test.com',
          subject: 'Subject João',
          html: 'Content 150',
        }),
      );
    });
  });
});
