declare class CreateContactDto {
    name: string;
    email: string;
    phone?: string;
    cpf?: string;
    role?: string;
}
declare class CreatePartnerDto {
    name: string;
    document: string;
    share?: number;
}
export declare class CreateCustomerDto {
    document: string;
    corporateName: string;
    tradeName?: string;
    address?: string;
    corporateGroupId?: string;
    contacts?: CreateContactDto[];
    partners?: CreatePartnerDto[];
}
export {};
