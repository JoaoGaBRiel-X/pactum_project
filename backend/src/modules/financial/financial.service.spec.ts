import { Test, TestingModule } from '@nestjs/testing';
import { FinancialService } from './financial.service';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';
import { NotificationService } from '../notification/notification.service';
import * as fs from 'fs';

jest.mock('fs');

describe('FinancialService', () => {
  let service: FinancialService;
  let mockPrisma: any;
  let mockNotificationService: any;

  beforeEach(async () => {
    mockPrisma = {
      receivable: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    mockNotificationService = {
      sendNotification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialService,
        { provide: TENANT_PRISMA_SERVICE, useValue: mockPrisma },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<FinancialService>(FinancialService);
    
    // Clear mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadBoleto', () => {
    it('should throw if receivable is not found', async () => {
      mockPrisma.receivable.findUnique.mockResolvedValue(null);
      await expect(service.uploadBoleto('1', Buffer.from('test'), 'test.pdf', 'user1'))
        .rejects.toThrow('Conta a receber não encontrada.');
    });

    it('should update boletoUrl and trigger notification', async () => {
      mockPrisma.receivable.findUnique.mockResolvedValue({ id: '1' });
      
      const mockUpdatedReceivable = {
        id: '1',
        boletoUrl: '/uploads/boletos/mock.pdf',
        customer: {
          id: 'cust-1',
          contacts: [{ email: 'client@test.com' }],
        },
      };

      mockPrisma.receivable.update.mockResolvedValue(mockUpdatedReceivable);
      
      // Mock fs.existsSync to true to bypass mkdir
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = await service.uploadBoleto('1', Buffer.from('test'), 'test.pdf', 'user1');

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(mockPrisma.receivable.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          data: expect.objectContaining({
            boletoUrl: expect.stringContaining('/uploads/boletos/'),
          }),
        })
      );

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        'NEW_BOLETO',
        'client@test.com',
        expect.objectContaining({
          customer: mockUpdatedReceivable.customer,
          receivable: mockUpdatedReceivable,
        })
      );

      expect(result).toEqual(mockUpdatedReceivable);
    });

    it('should update boletoUrl but NOT trigger notification if no email is found', async () => {
      mockPrisma.receivable.findUnique.mockResolvedValue({ id: '1' });
      
      const mockUpdatedReceivableWithoutContact = {
        id: '1',
        boletoUrl: '/uploads/boletos/mock.pdf',
        customer: {
          id: 'cust-1',
          contacts: [], // No contacts
        },
      };

      mockPrisma.receivable.update.mockResolvedValue(mockUpdatedReceivableWithoutContact);
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await service.uploadBoleto('1', Buffer.from('test'), 'test.pdf', 'user1');

      expect(mockNotificationService.sendNotification).not.toHaveBeenCalled();
    });
  });
});
