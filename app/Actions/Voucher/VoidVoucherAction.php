<?php

namespace App\Actions\Voucher;

use App\Enums\CA\TransactionType;
use App\Enums\CA\VoucherStatusType;
use App\Models\Transaction;
use App\Models\TransactionGroup;
use App\Models\Voucher;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VoidVoucherAction
{
    public function __invoke(Voucher $voucher): Voucher
    {
        return DB::transaction(function () use ($voucher) {
            if ($voucher->status === VoucherStatusType::VOID) {
                return $voucher;
            }

            $postedGroup = $voucher->postedTransactionGroup()->with('transactions')->first();

            if ($postedGroup && ! $this->hasReversal($postedGroup)) {
                $this->reverseJournal($voucher, $postedGroup);
            }

            $voucher->update([
                'status' => VoucherStatusType::VOID,
                'updated_by' => auth()->id(),
            ]);

            return $voucher->refresh();
        });
    }

    private function hasReversal(TransactionGroup $transactionGroup): bool
    {
        return TransactionGroup::query()
            ->where('reversal_of', $transactionGroup->id)
            ->exists();
    }

    public function reverseJournal(Voucher $voucher, ?TransactionGroup $postedGroup = null): void
    {
        $postedGroup ??= $voucher->postedTransactionGroup()->with('transactions')->first();

        if ($postedGroup && ! $this->hasReversal($postedGroup)) {
            $reversalGroup = TransactionGroup::create([
                'txn_id' => Str::uuid(),
                'date_time' => now(),
                'source_type' => Voucher::class,
                'source_id' => $voucher->id,
                'reference' => $voucher->voucher_no,
                'description' => 'Reversal: '.$voucher->description,
                'is_reversal' => true,
                'reversal_of' => $postedGroup->id,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);

            foreach ($postedGroup->transactions as $transaction) {
                Transaction::create([
                    'transaction_group_id' => $reversalGroup->id,
                    'account_id' => $transaction->account_id,
                    'business_partner_id' => $transaction->business_partner_id,
                    'type' => $this->oppositeType($transaction->type)->value,
                    'amount' => $transaction->amount,
                    'description' => 'Reversal: '.$transaction->description,
                ]);
            }
        }
    }

    private function oppositeType(TransactionType $type): TransactionType
    {
        return $type === TransactionType::DEBIT
            ? TransactionType::CREDIT
            : TransactionType::DEBIT;
    }
}
