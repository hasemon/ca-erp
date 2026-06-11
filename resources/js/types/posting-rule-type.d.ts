import { PostingRuleAccountType } from '@/types/posting-rule-account-type';

export interface PostingRuleType {
    id: number;
    name: string;
    account?: PostingRuleAccountType | null;
    account_id: number | null;
    accounts: PostingRuleAccountType[];
    amount_field: string;
    description: string;
    account_ids: number[];
    type: string;
    is_active: boolean;
    order: number;
    account_type?: string;
    document_type: string;
    dynamic_key: string | null;
    event: string;
    is_dynamic: boolean;
    is_optional: boolean;
    is_system: boolean;
    created_at: string;
    updated_at: string;
}
