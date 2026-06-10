<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'transaction_group_id' => $this->transaction_group_id,
            'account_id' => $this->account_id,
            'business_partner_id' => $this->business_partner_id,
            'type' => [
                'value' => $this->type->value,
                'label' => $this->type->label(),
            ],
            'amount' => (float) $this->amount,
            'description' => $this->description,
            'account' => $this->whenLoaded('account', fn () => [
                'id' => $this->account->id,
                'name' => $this->account->name,
                'code' => $this->account->code,
            ]),
            'business_partner' => BusinessPartnerResource::make($this->whenLoaded('businessPartner')),
            'transaction_group' => $this->whenLoaded('transactionGroup', function () {
                if (! $this->transactionGroup) {
                    return null;
                }

                return [
                    'id' => $this->transactionGroup->id,
                    'reference' => $this->transactionGroup->reference,
                    'date_time' => $this->transactionGroup->date_time,
                    'source_type' => $this->transactionGroup->source_type,
                    'description' => $this->transactionGroup->description,
                    'created_by' => [
                        'id' => $this->transactionGroup->createdBy?->id,
                        'name' => $this->transactionGroup->createdBy?->name,
                    ],
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
