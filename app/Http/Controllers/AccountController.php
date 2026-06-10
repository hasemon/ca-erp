<?php

namespace App\Http\Controllers\Tenant;

use App\Actions\Account\CreateAccountAction;
use App\Actions\Account\UpdateAccountAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Account\StoreAccountRequest;
use App\Http\Requests\Account\UpdateAccountRequest;
use App\Http\Resources\AccountResource;
use App\Http\Resources\AccountTypeResource;
use App\Models\Account;
use App\Models\AccountType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(Request $request): Response
    {
        $accountTypes = AccountType::with(['accounts' => function ($q) {
            $q->with(['children' => function ($q) {
                $q->with('children'); // Load a few levels deep, or we can load all flat and construct tree in JS
            }])->whereNull('parent_id');
        }])->get();

        $allAccounts = Account::query()->active()->get();

        return Inertia::render('tenant/account/index', [
            'accountTypes' => AccountTypeResource::collection($accountTypes),
            'flatAccounts' => AccountResource::collection($allAccounts),
        ]);
    }

    public function store(StoreAccountRequest $request, CreateAccountAction $createAction): RedirectResponse
    {
        try {
            $validated = $request->validated();
            $createAction($validated, $request);

            return back()->with('success', 'Account created successfully.');
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function update(
        UpdateAccountRequest $request,
        Account $account,
        UpdateAccountAction $updateAction
    ): RedirectResponse {
        try {
            $validated = $request->validated();
            $updateAction($validated, $account, $request);

            return back()->with('success', 'Account updated successfully.');
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function destroy(Account $account): RedirectResponse
    {
        try {
            if ($account->children()->exists()) {
                return back()->withErrors(['error' => 'Cannot delete an account with sub-accounts.']);
            }
            if ($account->is_system) {
                return back()->withErrors(['error' => 'Cannot delete a system account.']);
            }
            if ($account->voucherItems()->exists()) {
                return back()->withErrors(['error' => 'Cannot delete an account with existing transactions.']);
            }

            $account->delete();

            return back()->with('success', 'Account deleted successfully.');
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }
}
