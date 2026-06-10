<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusinessPartnerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'partnerable_type' => $this->whenLoaded('partnerables', function () {
                return $this->partnerables->first()?->partnerable_type;
            }),
            'partnerable_id' => $this->whenLoaded('partnerables', function () {
                return $this->partnerables->first()?->partnerable_id;
            }),
            'supplier' => $this->whenLoaded('suppliers', function () {
                $s = $this->suppliers->first();

                return $s ? ['id' => $s->id, 'name' => $s->name] : null;
            }),
            'default_receivable_account_id' => $this->default_receivable_account_id,
            'default_payable_account_id' => $this->default_payable_account_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
