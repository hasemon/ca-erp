<?php

namespace App\Http\Requests\Voucher;

use App\Enums\CA\VoucherStatusType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReceiptVoucherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'voucher_no' => [
                'required',
                'string',
                'max:50',
                Rule::unique('vouchers', 'voucher_no')->ignore($this->route('voucher')),
            ],
            'date_time' => ['required', 'date'],
            'status' => ['nullable', Rule::in([VoucherStatusType::DRAFT->value, VoucherStatusType::APPROVED->value])],
            'receive_in_account_id' => ['required', 'exists:accounts,id'],
            'credit_account_id' => ['required', 'exists:accounts,id'],
            'received_from_id' => ['nullable', 'exists:business_partners,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'reference' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ];
    }
}
