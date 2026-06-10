<?php

namespace App\Actions\Voucher\Journal;

use App\Actions\Voucher\StoreVoucherAction;
use App\Enums\CA\VoucherItemType;
use App\Enums\CA\VoucherStatusType;
use App\Enums\CA\VoucherType;
use App\Models\Voucher;

class CreateJournalVoucherAction
{
    public function __construct(
        private readonly StoreVoucherAction $storeVoucher,
    ) {}

    public function __invoke(array $data): Voucher
    {
        return ($this->storeVoucher)(
            voucherNo: $data['voucher_no'],
            dateTime: $data['date_time'],
            type: VoucherType::JOURNAL,
            totalAmount: $this->totalAmount($data),
            status: $this->status($data),
            description: $data['description'] ?? null,
            items: $this->items($data),
        );
    }

    private function items(array $data): array
    {
        return collect($data['items'])
            ->map(fn (array $item) => $this->storeVoucher->{$item['type']}(
                account: $item['account_id'],
                amount: $item['amount'],
                businessPartnerId: $item['business_partner_id'] ?? null,
                remarks: $item['remarks'] ?? null,
            ))
            ->all();
    }

    private function totalAmount(array $data): float|int|string
    {
        return collect($data['items'])
            ->where('type', VoucherItemType::DEBIT->value)
            ->sum('amount');
    }

    private function status(array $data): VoucherStatusType
    {
        return VoucherStatusType::from($data['status'] ?? VoucherStatusType::APPROVED->value);
    }
}
