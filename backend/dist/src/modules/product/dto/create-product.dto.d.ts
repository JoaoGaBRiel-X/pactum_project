declare class CreateSoftwareModuleDto {
    id?: string;
    name: string;
    description?: string;
    price: number;
}
export declare class CreateSoftwareProductDto {
    name: string;
    description?: string;
    isActive?: boolean;
    modules?: CreateSoftwareModuleDto[];
}
export {};
