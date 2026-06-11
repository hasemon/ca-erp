import { EnumType } from '@/types/enum-type';

export interface AccountTypeType {
    id: number;
    name: string;
    code: string;
    nature: string;
    is_active: boolean;
    accounts?: AccountType[];
}

export interface AccountType {
    id: number;
    account_type_id: number;
    parent_id: number | null;
    name: string;
    code: string;
    sub_type: EnumType;
    activity_type: EnumType;
    account_number: string | null;
    balance: number;
    is_group: boolean;
    is_system: boolean;
    is_active: boolean;
    description: string | null;
    parent?: AccountType;
    children?: AccountType[];
    account_type?: AccountTypeType;
}
