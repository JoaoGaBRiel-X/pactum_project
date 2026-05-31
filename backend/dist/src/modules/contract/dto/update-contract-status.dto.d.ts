export declare enum ContractStatus {
    DRAFT = "DRAFT",
    PENDING_SIGNATURE = "PENDING_SIGNATURE",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    RENEWAL_PENDING = "RENEWAL_PENDING",
    RENEGOTIATED = "RENEGOTIATED",
    CANCELLED = "CANCELLED",
    EXPIRED = "EXPIRED"
}
export declare class UpdateContractStatusDto {
    status: ContractStatus;
    reason: string;
}
