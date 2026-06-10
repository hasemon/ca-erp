<?php

namespace App\Actions\Voucher;

use App\Enums\CA\VoucherStatusType;
use App\Models\Voucher;
use Illuminate\Support\Facades\DB;

class ApproveVoucherAction
{
    public function __construct(
        private readonly PostVoucherAction $postVoucher,
    ) {}

    public function __invoke(Voucher $voucher): Voucher
    {
        return DB::transaction(function () use ($voucher) {
            if ($voucher->status === VoucherStatusType::VOID) {
                throw new \RuntimeException('Void vouchers cannot be approved.');
            }

            if ($voucher->status === VoucherStatusType::APPROVED) {
                if (! $voucher->postedTransactionGroup()->exists()) {
                    ($this->postVoucher)($voucher);
                }

                return $voucher;
            }

            $voucher->update([
                'status' => VoucherStatusType::APPROVED,
                'is_locked' => true,
                'updated_by' => auth()->id(),
            ]);

            ($this->postVoucher)($voucher->refresh());

            return $voucher->refresh();
        });
    }
}
