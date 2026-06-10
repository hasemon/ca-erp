<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VoucherResource extends JsonResource
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
            'voucher_no' => $this->voucher_no,
            'date_time' => $this->date_time->format('Y-m-d H:i:s'),
            'type' => [
                'value' => $this->type->value,
                'label' => $this->type->label(),
            ],
            'account_number' => $this->account_number,
            'total_amount' => $this->total_amount,
            'description' => $this->description,
            'data' => $this->data,
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
            ],
            'is_locked' => (bool) $this->is_locked,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
            'voucher_items' => VoucherItemResource::collection($this->whenLoaded('voucherItems')),
        ];
    }
}
