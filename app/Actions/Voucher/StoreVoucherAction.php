<?php

namespace App\Actions\Voucher;

use App\Enums\CA\VoucherItemType;
use App\Enums\CA\VoucherStatusType;
use App\Enums\CA\VoucherType;
use App\Models\Account;
use App\Models\Voucher;
use App\Models\VoucherItem;
use Illuminate\Support\Facades\DB;

class StoreVoucherAction
{
    private array $accounts = [];

    public function __construct(
        private readonly PostVoucherAction $postVoucher,
    ) {}

    public function __invoke(
        string $voucherNo,
        string $dateTime,
        VoucherType $type,
        float|int|string $totalAmount,
        VoucherStatusType $status = VoucherStatusType::DRAFT,
        ?string $description = null,
        array $items = [],
        ?array $data = null,
    ): Voucher {
        return DB::transaction(function () use ($voucherNo, $dateTime, $type, $totalAmount, $status, $description, $items, $data) {
            $voucher = $this->storeVoucher(
                voucherNo: $voucherNo,
                dateTime: $dateTime,
                type: $type,
                totalAmount: $totalAmount,
                status: $status,
                description: $description,
                data: $data,
            );

            foreach ($items as $item) {
                $this->createItem($voucher, $item);
            }

            if ($voucher->status === VoucherStatusType::APPROVED) {
                if (! $voucher->voucherItems()->exists()) {
                    throw new \RuntimeException('Approved vouchers must have debit and credit items.');
                }

                ($this->postVoucher)($voucher);
            }

            return $voucher;
        });
    }

    public function debit(
        Account|int $account,
        float|int|string $amount,
        ?int $businessPartnerId = null,
        ?string $remarks = null,
    ): array {
        return $this->item(
            account: $account,
            type: VoucherItemType::DEBIT,
            amount: $amount,
            businessPartnerId: $businessPartnerId,
            remarks: $remarks,
        );
    }

    public function credit(
        Account|int $account,
        float|int|string $amount,
        ?int $businessPartnerId = null,
        ?string $remarks = null,
    ): array {
        return $this->item(
            account: $account,
            type: VoucherItemType::CREDIT,
            amount: $amount,
            businessPartnerId: $businessPartnerId,
            remarks: $remarks,
        );
    }

    private function createItem(Voucher $voucher, array $item): void
    {
        $account = $this->account($item['account']);

        if ($item['type'] === VoucherItemType::DEBIT) {
            $this->storeItem(
                voucher: $voucher,
                account: $account,
                type: VoucherItemType::DEBIT,
                amount: $item['amount'],
                businessPartnerId: $item['business_partner_id'] ?? null,
                remarks: $item['remarks'] ?? null,
            );

            return;
        }

        $this->storeItem(
            voucher: $voucher,
            account: $account,
            type: VoucherItemType::CREDIT,
            amount: $item['amount'],
            businessPartnerId: $item['business_partner_id'] ?? null,
            remarks: $item['remarks'] ?? null,
        );
    }

    private function storeVoucher(
        string $voucherNo,
        string $dateTime,
        VoucherType $type,
        float|int|string $totalAmount,
        VoucherStatusType $status,
        ?string $description = null,
        ?array $data = null,
    ): Voucher {
        return Voucher::create([
            'voucher_no' => $voucherNo,
            'date_time' => $dateTime,
            'type' => $type,
            'total_amount' => $totalAmount,
            'description' => $description,
            'data' => $data,
            'status' => $status,
            'is_locked' => $status === VoucherStatusType::APPROVED,
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);
    }

    private function storeItem(
        Voucher $voucher,
        Account $account,
        VoucherItemType $type,
        float|int|string $amount,
        ?int $businessPartnerId = null,
        ?string $remarks = null,
    ): VoucherItem {
        return $voucher->voucherItems()->create([
            'account_id' => $account->getKey(),
            'business_partner_id' => $businessPartnerId,
            'type' => $type->value,
            'amount' => $amount,
            'remarks' => $remarks,
        ]);
    }

    private function item(
        Account|int $account,
        VoucherItemType $type,
        float|int|string $amount,
        ?int $businessPartnerId = null,
        ?string $remarks = null,
    ): array {
        return [
            'account' => $account,
            'business_partner_id' => $businessPartnerId,
            'type' => $type,
            'amount' => $amount,
            'remarks' => $remarks,
        ];
    }

    private function account(Account|int $account): Account
    {
        if ($account instanceof Account) {
            return $account;
        }

        return $this->accounts[$account] ??= Account::query()->findOrFail($account);
    }
}
