<?php

namespace App\Http\Requests\Voucher;

use App\Enums\CA\VoucherStatusType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentVoucherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'voucher_no' => ['required', 'string', 'max:50', 'unique:vouchers,voucher_no'],
            'date_time' => ['required', 'date'],
            'status' => ['nullable', Rule::in([VoucherStatusType::DRAFT->value, VoucherStatusType::APPROVED->value])],
            'pay_from_account_id' => ['required', 'exists:accounts,id'],
            'debit_account_id' => ['required', 'exists:accounts,id'],
            'paid_to_id' => ['nullable', 'exists:business_partners,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'reference' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ];
    }
}
