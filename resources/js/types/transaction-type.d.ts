import { BusinessPartnerType } from '@/types/business-partner-type';
import { EnumStringType } from '@/types/enum-type';

export interface TransactionType {
    id: number;
    transaction_group_id: number;
    account_id: number;
    business_partner_id?: number;
    type: EnumStringType;
    amount: number;
    description: string;
    account?: {
        id: number;
        name: string;
        code: string;
    };
    business_partner?: BusinessPartnerType;
    transaction_group?: {
        id: number;
        reference: string;
        date_time: string;
        source_type: string;
        description: string;
        created_by?: {
            id: number;
            name: string;
        };
    };
    created_at: string;
    updated_at: string;
}
