<?php

namespace App\Actions\Voucher\Advance;

use App\Actions\Voucher\StoreVoucherAction;
use App\Enums\CA\VoucherStatusType;
use App\Enums\CA\VoucherType;
use App\Models\Voucher;

class CreateAdvanceVoucherAction
{
    public function __construct(
        private readonly StoreVoucherAction $storeVoucher,
    ) {}

    public function __invoke(array $data): Voucher
    {
        return ($this->storeVoucher)(
            voucherNo: $data['voucher_no'],
            dateTime: $data['date_time'],
            type: VoucherType::ADVANCE,
            totalAmount: $data['amount'],
            status: $this->status($data),
            description: $data['description'] ?? null,
            items: $this->items($data),
            data: ['advance_type' => $data['advance_type']],
        );
    }

    private function items(array $data): array
    {
        if ($data['advance_type'] === 'received') {
            return [
                $this->storeVoucher->debit(
                    account: $data['cash_account_id'],
                    amount: $data['amount'],
                    remarks: $data['reference'] ?? null,
                ),
                $this->storeVoucher->credit(
                    account: $data['advance_account_id'],
                    amount: $data['amount'],
                    businessPartnerId: $data['business_partner_id'] ?? null,
                    remarks: $data['reference'] ?? null,
                ),
            ];
        }

        return [
            $this->storeVoucher->debit(
                account: $data['advance_account_id'],
                amount: $data['amount'],
                businessPartnerId: $data['business_partner_id'] ?? null,
                remarks: $data['reference'] ?? null,
            ),
            $this->storeVoucher->credit(
                account: $data['cash_account_id'],
                amount: $data['amount'],
                remarks: $data['reference'] ?? null,
            ),
        ];
    }

    private function status(array $data): VoucherStatusType
    {
        return VoucherStatusType::from($data['status'] ?? VoucherStatusType::APPROVED->value);
    }
}
