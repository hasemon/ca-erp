<?php

namespace App\Actions\Voucher\Refund;

use App\Actions\Voucher\StoreVoucherAction;
use App\Enums\CA\VoucherStatusType;
use App\Enums\CA\VoucherType;
use App\Models\Voucher;

class CreateRefundVoucherAction
{
    public function __construct(
        private readonly StoreVoucherAction $storeVoucher,
    ) {}

    public function __invoke(array $data): Voucher
    {
        return ($this->storeVoucher)(
            voucherNo: $data['voucher_no'],
            dateTime: $data['date_time'],
            type: VoucherType::REFUND,
            totalAmount: $data['amount'],
            status: $this->status($data),
            description: $data['description'] ?? null,
            items: [
                $this->storeVoucher->debit(
                    account: $data['debit_account_id'],
                    amount: $data['amount'],
                    businessPartnerId: $data['refunded_to_id'] ?? null,
                    remarks: $data['reference'] ?? null,
                ),
                $this->storeVoucher->credit(
                    account: $data['pay_from_account_id'],
                    amount: $data['amount'],
                    remarks: $data['reference'] ?? null,
                ),
            ],
        );
    }

    private function status(array $data): VoucherStatusType
    {
        return VoucherStatusType::from($data['status'] ?? VoucherStatusType::APPROVED->value);
    }
}
