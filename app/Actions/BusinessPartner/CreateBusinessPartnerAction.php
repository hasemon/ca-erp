<?php

namespace App\Actions\BusinessPartner;

use App\Models\BusinessPartner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CreateBusinessPartnerAction
{
    public function __invoke(array $data, ?Request $request = null): BusinessPartner
    {
        return DB::transaction(function () use ($data) {
            $partner = BusinessPartner::create([
                'name' => $data['name'],
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'default_receivable_account_id' => $data['default_receivable_account_id'] ?? null,
                'default_payable_account_id' => $data['default_payable_account_id'] ?? null,
            ]);

            if (! empty($data['partnerable_type']) && ! empty($data['partnerable_id'])) {
                $partner->partnerables()->create([
                    'partnerable_type' => $data['partnerable_type'],
                    'partnerable_id' => $data['partnerable_id'],
                ]);
            }

            return $partner;
        });
    }
}
