<?php

namespace App\Actions\Voucher\Journal;

use App\Actions\Voucher\PostVoucherAction;
use App\Actions\Voucher\VoidVoucherAction;
use App\Enums\CA\VoucherItemType;
use App\Enums\CA\VoucherStatusType;
use App\Models\Voucher;
use Illuminate\Support\Facades\DB;

class UpdateJournalVoucherAction
{
    public function __construct(
        private readonly PostVoucherAction $postVoucher,
        private readonly VoidVoucherAction $voidVoucher,
    ) {}

    public function __invoke(Voucher $voucher, array $data): Voucher
    {
        if (! $voucher->isEditable()) {
            throw new \RuntimeException('This voucher is locked and cannot be edited. Unlock it first.');
        }

        return DB::transaction(function () use ($voucher, $data) {
            $status = VoucherStatusType::from($data['status'] ?? VoucherStatusType::APPROVED->value);
            $isApproved = $voucher->status === VoucherStatusType::APPROVED;

            // For approved (unlocked) vouchers: reverse the existing journal before re-posting
            if ($isApproved) {
                ($this->voidVoucher)->reverseJournal($voucher);
            }

            $totalAmount = collect($data['items'])
                ->where('type', VoucherItemType::DEBIT->value)
                ->sum('amount');

            $voucher->update([
                'date_time' => $data['date_time'],
                'total_amount' => $totalAmount,
                'description' => $data['description'] ?? null,
                'status' => $status,
                'is_locked' => $status === VoucherStatusType::APPROVED,
                'updated_by' => auth()->id(),
            ]);

            $voucher->voucherItems()->delete();

            foreach ($data['items'] as $item) {
                $voucher->voucherItems()->create([
                    'account_id' => $item['account_id'],
                    'business_partner_id' => $item['business_partner_id'] ?? null,
                    'type' => $item['type'],
                    'amount' => $item['amount'],
                    'remarks' => $item['remarks'] ?? null,
                ]);
            }

            if ($status === VoucherStatusType::APPROVED) {
                ($this->postVoucher)($voucher->refresh());
            }

            return $voucher->refresh();
        });
    }
}
