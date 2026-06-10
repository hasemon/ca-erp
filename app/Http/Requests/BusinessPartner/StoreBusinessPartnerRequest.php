<?php

namespace App\Http\Requests\BusinessPartner;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class StoreBusinessPartnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('business-partner.create');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'partnerable_type' => ['nullable', 'string'],
            'partnerable_id' => ['nullable', 'integer'],
            'default_receivable_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'default_payable_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
        ];
    }
}
