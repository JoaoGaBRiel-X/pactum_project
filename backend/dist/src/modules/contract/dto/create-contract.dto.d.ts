export declare enum RenewalMode {
    AUTOMATIC = "AUTOMATIC",
    MANUAL = "MANUAL"
}
declare class ContractItemDto {
    moduleId: string;
    quantity: number;
    discount?: number;
}
export declare class CreateContractDto {
    customerId: string;
    productId: string;
    globalDiscount?: number;
    renewalMode?: RenewalMode;
    items: ContractItemDto[];
}
export {};
