declare class CreateContactDto {
    name: string;
    email: string;
    phone?: string;
    cpf?: string;
    role?: string;
    portalAccess?: boolean;
}
declare class CreatePartnerDto {
    name: string;
    document: string;
    share?: number;
    isLegalRep?: boolean;
}
export declare class CreateLegalRepresentativeDto {
    name: string;
    cpf: string;
    email?: string;
    phone?: string;
}
export declare class CreateCustomerDto {
    document: string;
    corporateName: string;
    tradeName?: string;
    address?: string;
    corporateGroupId?: string;
    contacts?: CreateContactDto[];
    partners?: CreatePartnerDto[];
    legalRepresentatives?: CreateLegalRepresentativeDto[];
}
export {};
