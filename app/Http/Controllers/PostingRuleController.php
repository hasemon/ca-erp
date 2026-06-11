<?php

namespace App\Http\Controllers;

use App\Actions\PostingRule\UpdatePostingRuleAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\PostingRule\UpdatePostingRuleRequest;
use App\Http\Resources\AccountResource;
use App\Models\Account;
use App\Models\PostingRule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PostingRuleController extends Controller
{
    public function index(Request $request): Response
    {
        $rules = PostingRule::query()
            ->with('accounts')
            ->orderBy('order')
            ->get()
            ->map(function ($rule) {
                // Map the account relationship to account_ids for the frontend form
                $rule->account_ids = $rule->accounts->pluck('id')->toArray();
                // Map the first account to account_id for single-select compatibility
                $rule->account_id = $rule->accounts->first()?->id;
                $rule->account = $rule->accounts->first(); // For display

                return $rule;
            });

        $accounts = Account::query()->active()
            ->with('accountType')
            ->get();

        return Inertia::render('tenant/posting-rule/index', [
            'rules' => $rules->groupBy('document_type'),
            'accounts' => AccountResource::collection($accounts),
        ]);
    }

    public function update(UpdatePostingRuleRequest $request, UpdatePostingRuleAction $updateAction): RedirectResponse
    {
        $data = $request->validated();

        $updateAction($data);

        return back();
    }
}
