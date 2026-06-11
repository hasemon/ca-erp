import { AccountType } from '@/types/account-type';
import { BusinessPartnerType } from '@/types/business-partner-type';
import { EnumStringType } from '@/types/enum-type';

export interface VoucherType {
    id: number;
    voucher_no: string;
    date_time: string;
    type: EnumStringType;
    account_number: string | null;
    total_amount: number;
    description: string | null;
    data: {
        advance_type?: 'given' | 'received';
    } | null;
    status: EnumStringType;
    is_locked: boolean;
    voucher_items: VoucherItemType[];
    created_at: string;
    updated_at: string;
}

export interface VoucherItemType {
    id: number;
    voucher_id: number;
    account_id: number;
    amount: number;
    business_partner?: BusinessPartnerType | null;
    account?: AccountType | null;
    remarks: string;
    type: EnumStringType;
}
