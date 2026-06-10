<?php

namespace App\Actions\Voucher;

use App\Models\Voucher;

class LockVoucherAction
{
    public function __invoke(Voucher $voucher): Voucher
    {
        $voucher->update([
            'is_locked' => true,
            'updated_by' => auth()->id(),
        ]);

        return $voucher->refresh();
    }
}
