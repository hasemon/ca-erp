<?php

namespace App\Http\Requests\PostingRule;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdatePostingRuleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Gate::allows('posting-rule.edit');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'rules' => ['required', 'array'],
            'rules.*.id' => ['required', 'exists:posting_rules,id'],
            'rules.*.account_id' => ['nullable', 'exists:accounts,id'],
            'rules.*.account_ids' => ['nullable', 'array'],
            'rules.*.account_ids.*' => ['exists:accounts,id'],
            'rules.*.is_active' => ['required', 'boolean'],
        ];
    }
}
