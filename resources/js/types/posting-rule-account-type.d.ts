export interface PostingRuleAccountType {
    id: number;
    account_number: string | null;
    account_type_id: number;
    activity_type: string;
    code: string;
    description: string;
    is_active: boolean;
    is_group: boolean;
    is_system: boolean;
    name: string;
    opening_balance: string;
    parent_id: number;
    pivot: {
        account_id: number;
        posting_rule_id: number;
    };
    sub_type: string;
    created_at: string;
    deleted_at: string | null;
    updated_at: string;
}
