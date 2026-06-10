<?php

namespace App\Actions\Voucher\Advance;

use App\Actions\Voucher\PostVoucherAction;
use App\Actions\Voucher\VoidVoucherAction;
use App\Enums\CA\VoucherItemType;
use App\Enums\CA\VoucherStatusType;
use App\Models\Voucher;
use Illuminate\Support\Facades\DB;

class UpdateAdvanceVoucherAction
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

            if ($isApproved) {
                ($this->voidVoucher)->reverseJournal($voucher);
            }

            $voucher->update([
                'date_time' => $data['date_time'],
                'total_amount' => $data['amount'],
                'description' => $data['description'] ?? null,
                'data' => ['advance_type' => $data['advance_type']],
                'status' => $status,
                'is_locked' => $status === VoucherStatusType::APPROVED,
                'updated_by' => auth()->id(),
            ]);

            $voucher->voucherItems()->delete();

            foreach ($this->items($data) as $item) {
                $voucher->voucherItems()->create($item);
            }

            if ($status === VoucherStatusType::APPROVED) {
                ($this->postVoucher)($voucher->refresh());
            }

            return $voucher->refresh();
        });
    }

    private function items(array $data): array
    {
        if ($data['advance_type'] === 'received') {
            return [
                [
                    'account_id' => $data['cash_account_id'],
                    'type' => VoucherItemType::DEBIT->value,
                    'amount' => $data['amount'],
                    'remarks' => $data['reference'] ?? null,
                ],
                [
                    'account_id' => $data['advance_account_id'],
                    'business_partner_id' => $data['business_partner_id'] ?? null,
                    'type' => VoucherItemType::CREDIT->value,
                    'amount' => $data['amount'],
                    'remarks' => $data['reference'] ?? null,
                ],
            ];
        }

        return [
            [
                'account_id' => $data['advance_account_id'],
                'business_partner_id' => $data['business_partner_id'] ?? null,
                'type' => VoucherItemType::DEBIT->value,
                'amount' => $data['amount'],
                'remarks' => $data['reference'] ?? null,
            ],
            [
                'account_id' => $data['cash_account_id'],
                'type' => VoucherItemType::CREDIT->value,
                'amount' => $data['amount'],
                'remarks' => $data['reference'] ?? null,
            ],
        ];
    }
}
