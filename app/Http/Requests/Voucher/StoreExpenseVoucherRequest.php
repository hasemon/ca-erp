<?php

namespace App\Http\Requests\Voucher;

use App\Enums\CA\VoucherStatusType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExpenseVoucherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $voucherId = $this->route('voucher')?->id;

        return [
            'voucher_no' => ['required', 'string', 'max:50', 'unique:vouchers,voucher_no,'.$voucherId],
            'date_time' => ['required', 'date'],
            'status' => ['nullable', Rule::in([VoucherStatusType::DRAFT->value, VoucherStatusType::APPROVED->value])],
            'expense_account_id' => ['required', 'exists:accounts,id'],
            'paid_to_id' => ['nullable', 'exists:business_partners,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'source_account_id' => ['required', 'exists:accounts,id'],
            'reference' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ];
    }
}
