declare class CreateSoftwareModuleDto {
    id?: string;
    name: string;
    description?: string;
    price: number;
    isBaseOffer?: boolean;
    maxQuantity?: number;
}
export declare class CreateSoftwareProductDto {
    name: string;
    description?: string;
    isActive?: boolean;
    productGroupId?: string;
    modules: CreateSoftwareModuleDto[];
}
export {};
