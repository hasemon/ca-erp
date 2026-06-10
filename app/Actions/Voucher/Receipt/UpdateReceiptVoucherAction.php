<?php

namespace App\Actions\Voucher\Receipt;

use App\Actions\Voucher\PostVoucherAction;
use App\Actions\Voucher\VoidVoucherAction;
use App\Enums\CA\VoucherItemType;
use App\Enums\CA\VoucherStatusType;
use App\Models\Voucher;
use Illuminate\Support\Facades\DB;

class UpdateReceiptVoucherAction
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

            $voucher->update([
                'date_time' => $data['date_time'],
                'total_amount' => $data['amount'],
                'description' => $data['description'] ?? null,
                'status' => $status,
                'is_locked' => $status === VoucherStatusType::APPROVED,
                'updated_by' => auth()->id(),
            ]);

            $voucher->voucherItems()->delete();

            $voucher->voucherItems()->create([
                'account_id' => $data['receive_in_account_id'],
                'type' => VoucherItemType::DEBIT->value,
                'amount' => $data['amount'],
                'remarks' => $data['reference'] ?? null,
            ]);

            $voucher->voucherItems()->create([
                'account_id' => $data['credit_account_id'],
                'business_partner_id' => $data['received_from_id'] ?? null,
                'type' => VoucherItemType::CREDIT->value,
                'amount' => $data['amount'],
                'remarks' => $data['reference'] ?? null,
            ]);

            if ($status === VoucherStatusType::APPROVED) {
                ($this->postVoucher)($voucher->refresh());
            }

            return $voucher->refresh();
        });
    }
}
