<?php

namespace App\Actions\Voucher;

use App\Models\Transaction;
use App\Models\TransactionGroup;
use App\Models\Voucher;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PostVoucherAction
{
    public function __invoke(Voucher $voucher): void
    {
        DB::transaction(function () use ($voucher) {
            $existingGroup = $voucher->postedTransactionGroup()->first();
            if ($existingGroup) {
                $hasReversal = TransactionGroup::where('reversal_of', $existingGroup->id)->exists();
                if (! $hasReversal) {
                    throw new \RuntimeException('Voucher is already posted to the ledger.');
                }
            }

            if (! $voucher->voucherItems()->exists()) {
                throw new \RuntimeException('Voucher has no items to post.');
            }

            // Create Transaction Group
            $transactionGroup = TransactionGroup::create([
                'txn_id' => Str::uuid(),
                'date_time' => $voucher->date_time,
                'source_type' => Voucher::class,
                'source_id' => $voucher->id,
                'reference' => $voucher->voucher_no,
                'description' => $voucher->description,
                'is_reversal' => false,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);

            // Create Transactions for each VoucherItem
            foreach ($voucher->voucherItems as $item) {
                Transaction::create([
                    'transaction_group_id' => $transactionGroup->id,
                    'account_id' => $item->account_id,
                    'business_partner_id' => $item->business_partner_id,
                    'type' => $item->type->value,
                    'amount' => $item->amount,
                    'description' => $item->remarks ?? $voucher->description,
                ]);
            }
        });
    }
}
