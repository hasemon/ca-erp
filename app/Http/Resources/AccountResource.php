<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccountResource extends JsonResource
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
            'parent_id' => $this->parent_id,
            'name' => $this->name,
            'code' => $this->code,
            'sub_type' => [
                'value' => $this->sub_type->value,
                'label' => $this->sub_type->label(),
            ],
            'activity_type' => [
                'value' => $this->activity_type->value,
                'label' => $this->activity_type->label(),
            ],
            'account_number' => $this->account_number,
            'is_group' => $this->is_group,
            'is_system' => $this->is_system,
            'is_active' => $this->is_active,
            'description' => $this->description,
            'balance' => $this->balance,
            'account_type' => AccountTypeResource::make($this->whenLoaded('accountType')),
            'parent' => self::make($this->whenLoaded('parent')),
            'children' => self::collection($this->whenLoaded('children')),
        ];
    }
}
