<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VoucherItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'voucher_id' => $this->voucher_id,
            'account_id' => $this->account_id,
            'type' => [
                'value' => $this->type->value,
                'label' => $this->type->label(),
            ],
            'amount' => $this->amount,
            'remarks' => $this->remarks,
            'account' => AccountResource::make($this->whenLoaded('account')),
            'business_partner' => BusinessPartnerResource::make($this->whenLoaded('businessPartner')),
        ];
    }
}
