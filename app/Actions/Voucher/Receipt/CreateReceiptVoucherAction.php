<?php

namespace App\Actions\Voucher\Receipt;

use App\Actions\Voucher\StoreVoucherAction;
use App\Enums\CA\VoucherStatusType;
use App\Enums\CA\VoucherType;
use App\Models\Voucher;

class CreateReceiptVoucherAction
{
    public function __construct(
        private readonly StoreVoucherAction $storeVoucher,
    ) {}

    public function __invoke(array $data): Voucher
    {
        return ($this->storeVoucher)(
            voucherNo: $data['voucher_no'],
            dateTime: $data['date_time'],
            type: VoucherType::RECEIPT,
            totalAmount: $data['amount'],
            status: $this->status($data),
            description: $data['description'] ?? null,
            items: [
                $this->storeVoucher->debit(
                    account: $data['receive_in_account_id'],
                    amount: $data['amount'],
                    remarks: $data['reference'] ?? null,
                ),
                $this->storeVoucher->credit(
                    account: $data['credit_account_id'],
                    amount: $data['amount'],
                    businessPartnerId: $data['received_from_id'] ?? null,
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
