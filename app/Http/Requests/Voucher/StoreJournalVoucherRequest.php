<?php

namespace App\Http\Requests\Voucher;

use App\Enums\CA\TransactionType;
use App\Enums\CA\VoucherStatusType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreJournalVoucherRequest extends FormRequest
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
            'reference' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:2'],
            'items.*.account_id' => ['required', 'exists:accounts,id'],
            'items.*.business_partner_id' => ['nullable', 'exists:business_partners,id'],
            'items.*.type' => ['required', new Enum(TransactionType::class)],
            'items.*.amount' => ['required', 'numeric', 'min:0.01'],
            'items.*.remarks' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $items = $this->input('items', []);
            $debits = collect($items)->where('type', TransactionType::DEBIT->value)->sum('amount');
            $credits = collect($items)->where('type', TransactionType::CREDIT->value)->sum('amount');

            if (round($debits, 2) !== round($credits, 2)) {
                $validator->errors()->add('items', "Total Debits ($debits) must equal Total Credits ($credits).");
            }
        });
    }
}
