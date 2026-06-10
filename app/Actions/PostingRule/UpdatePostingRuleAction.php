<?php

namespace App\Actions\PostingRule;

use App\Models\PostingRule;
use Illuminate\Support\Facades\DB;

class UpdatePostingRuleAction
{
    public function __invoke(array $data)
    {
        return DB::transaction(function () use ($data) {
            foreach ($data['rules'] as $ruleData) {
                $rule = PostingRule::query()->find($ruleData['id']);
                if ($rule) {
                    $rule->update([
                        'is_active' => $ruleData['is_active'],
                    ]);

                    // Determine if the rule is a voucher or non-voucher
                    $isVoucher = str_contains($rule->document_type, 'Voucher') || str_contains($rule->document_type, 'Refund');

                    if ($isVoucher) {
                        // For vouchers, we use the account_ids array
                        if (isset($ruleData['account_ids'])) {
                            $rule->accounts()->sync($ruleData['account_ids']);
                        }
                    } else {
                        // For non-vouchers, we use the single account_id
                        if (array_key_exists('account_id', $ruleData)) {
                            $rule->accounts()->sync($ruleData['account_id'] ? [$ruleData['account_id']] : []);
                        }
                    }
                }
            }

            return true;
        });
    }
}
