import { Customer, Prisma } from '@prisma/client';

export const CUSTOMER_REPOSITORY = 'CUSTOMER_REPOSITORY';

export interface ICustomerRepository {
  create(data: Prisma.CustomerCreateInput | any, include?: Prisma.CustomerInclude): Promise<Customer | any>;
  findAll(where?: Prisma.CustomerWhereInput, include?: Prisma.CustomerInclude): Promise<Customer[] | any[]>;
  findById(id: string, where?: Prisma.CustomerWhereInput, include?: Prisma.CustomerInclude): Promise<Customer | any | null>;
  update(id: string, data: Prisma.CustomerUpdateInput | any, include?: Prisma.CustomerInclude): Promise<Customer | any>;
  delete(id: string): Promise<void>;
  findGroupById(groupId: string): Promise<any | null>;
}
