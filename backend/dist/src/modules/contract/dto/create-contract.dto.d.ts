export declare class CreateContractItemDto {
    moduleId: string;
    quantity: number;
    discount: number;
}
export declare class CreateContractDto {
    customerId: string;
    productId: string;
    globalDiscount: number;
    renewalMode: string;
    adjustmentIndexId?: string;
    items: CreateContractItemDto[];
}
