<?php

namespace App\Http\Requests\Account;

use App\Enums\CA\AccountActivityType;
use App\Enums\CA\AccountSubType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class UpdateAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('account.update');
    }

    public function rules(): array
    {
        return [
            'parent_id' => ['nullable', 'exists:accounts,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', Rule::unique('accounts')->ignore($this->route('account'))],
            'sub_type' => ['nullable', Rule::enum(AccountSubType::class)],
            'activity_type' => ['nullable', Rule::enum(AccountActivityType::class)],
            'account_number' => ['nullable', 'string', 'max:50'],
            'is_group' => ['boolean'],
            'is_active' => ['boolean'],
            'description' => ['nullable', 'string'],
        ];
    }
}
