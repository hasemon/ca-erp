<?php

namespace App\Actions\Voucher;

use App\Enums\CA\VoucherStatusType;
use App\Models\Voucher;

class UnlockVoucherAction
{
    public function __invoke(Voucher $voucher): Voucher
    {
        if ($voucher->status !== VoucherStatusType::APPROVED) {
            throw new \RuntimeException('Only approved vouchers can be unlocked.');
        }

        $voucher->update([
            'is_locked' => false,
            'updated_by' => auth()->id(),
        ]);

        return $voucher->refresh();
    }
}
