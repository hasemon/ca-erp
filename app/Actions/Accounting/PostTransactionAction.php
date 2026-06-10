<?php

namespace App\Actions\Accounting;

use App\Models\PostingRule;
use App\Models\Transaction;
use App\Models\TransactionGroup;
use BackedEnum;
use DomainException;
use Illuminate\Support\Str;

class PostTransactionAction
{
    /**
     * Execute the posting rules for a given document and event.
     */
    public function execute(mixed $document, string $event): void
    {
        $rules = PostingRule::with('accounts')
            ->where('document_type', get_class($document))
            ->where('event', $event)
            ->where('is_active', true)
            ->orderBy('order')
            ->get()
            ->filter(fn (PostingRule $rule): bool => $this->conditionsMatch($rule, $document))
            ->values();

        if ($rules->isEmpty()) {
            return;
        }

        $group = TransactionGroup::create([
            'txn_id' => (string) Str::uuid(),
            'date_time' => now(),
            'source_type' => get_class($document),
            'source_id' => $document->id,
            'reference' => data_get($document, 'reference'),
            'description' => "Auto-posted from {$event} of ".class_basename($document),
            'created_by' => $document->created_by ?? auth()->id(),
            'updated_by' => $document->updated_by ?? auth()->id(),
        ]);

        foreach ($rules as $rule) {
            $accountId = $this->resolveAccount($rule, $document);
            $amount = $this->resolveAmount($rule, $document);

            // Skip if amount is zero
            if (! $amount || $amount == 0) {
                continue;
            }

            if (! $accountId) {
                if (! $rule->is_optional) {
                    throw new DomainException("Required posting account could not be resolved for rule [{$rule->name}].");
                }

                continue;
            }

            Transaction::create([
                'transaction_group_id' => $group->id,
                'account_id' => $accountId,
                'business_partner_id' => $this->resolveBusinessPartnerId($document),
                'type' => $rule->type, // 'debit' or 'credit'
                'amount' => $amount,
            ]);
        }

        if ($document instanceof \App\Models\Payment) {
            $document->update(['transaction_group_id' => $group->id]);
        }
    }

    /**
     * Resolve the account ID for a rule.
     */
    protected function resolveAccount(PostingRule $rule, mixed $doc): ?int
    {
        if ($rule->is_dynamic) {
            return match ($rule->dynamic_key) {
                'customer_receivable' => $doc->customer?->businessPartners()->value('default_receivable_account_id') ?? $doc->businessPartner?->default_receivable_account_id,
                'supplier_payable' => $doc->supplier?->businessPartners()->value('default_payable_account_id') ?? $doc->businessPartner?->default_payable_account_id,
                'payment_account' => $doc->payment_account_id,
                'cash_account' => $doc->cash_account_id ?? $doc->payment_account_id,
                default => null,
            };
        }

        // For static rules, we use the first associated account from the pivot table
        return $rule->accounts->first()?->id;
    }

    /**
     * Resolve the amount from the document.
     *
     * @param  mixed  $doc
     */
    protected function resolveAmount(PostingRule $rule, $doc): float|int
    {
        return data_get($doc, $rule->amount_field, 0);
    }

    protected function conditionsMatch(PostingRule $rule, mixed $document): bool
    {
        if (empty($rule->conditions)) {
            return true;
        }

        foreach ($rule->conditions as $field => $expected) {
            $actual = data_get($document, $field);

            if ($actual instanceof BackedEnum) {
                $actual = $actual->value;
            }

            if (is_array($expected)) {
                if (! in_array($actual, $expected, true)) {
                    return false;
                }

                continue;
            }

            if ((string) $actual !== (string) $expected) {
                return false;
            }
        }

        return true;
    }

    protected function resolveBusinessPartnerId($document): ?int
    {
        if (isset($document->business_partner_id)) {
            return $document->business_partner_id;
        }

        if (method_exists($document, 'supplier') && $document->supplier) {
            return $document->supplier->businessPartners()->value('business_partners.id');
        }

        if (method_exists($document, 'customer') && $document->customer) {
            return $document->customer->businessPartners()->value('business_partners.id');
        }

        return null;
    }
}
