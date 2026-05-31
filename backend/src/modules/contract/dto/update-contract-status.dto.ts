import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';

export enum ContractStatus {
  DRAFT = 'DRAFT',
  PENDING_SIGNATURE = 'PENDING_SIGNATURE',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  RENEWAL_PENDING = 'RENEWAL_PENDING',
  RENEGOTIATED = 'RENEGOTIATED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export class UpdateContractStatusDto {
  @IsEnum(ContractStatus)
  status: ContractStatus;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
