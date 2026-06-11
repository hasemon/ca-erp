<?php

namespace App\Http\Controllers;

use App\Actions\Voucher\Advance\CreateAdvanceVoucherAction;
use App\Actions\Voucher\Advance\UpdateAdvanceVoucherAction;
use App\Actions\Voucher\ApproveVoucherAction;
use App\Actions\Voucher\Contra\CreateContraVoucherAction;
use App\Actions\Voucher\Contra\UpdateContraVoucherAction;
use App\Actions\Voucher\Expense\CreateExpenseVoucherAction;
use App\Actions\Voucher\Expense\UpdateExpenseVoucherAction;
use App\Actions\Voucher\Journal\CreateJournalVoucherAction;
use App\Actions\Voucher\Journal\UpdateJournalVoucherAction;
use App\Actions\Voucher\LockVoucherAction;
use App\Actions\Voucher\Payment\CreatePaymentVoucherAction;
use App\Actions\Voucher\Payment\UpdatePaymentVoucherAction;
use App\Actions\Voucher\Receipt\CreateReceiptVoucherAction;
use App\Actions\Voucher\Receipt\UpdateReceiptVoucherAction;
use App\Actions\Voucher\Refund\CreateRefundVoucherAction;
use App\Actions\Voucher\Refund\UpdateRefundVoucherAction;
use App\Actions\Voucher\UnlockVoucherAction;
use App\Actions\Voucher\VoidVoucherAction;
use App\Enums\CA\VoucherStatusType;
use App\Enums\CA\VoucherType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Voucher\StoreAdvanceVoucherRequest;
use App\Http\Requests\Voucher\StoreContraVoucherRequest;
use App\Http\Requests\Voucher\StoreExpenseVoucherRequest;
use App\Http\Requests\Voucher\StoreJournalVoucherRequest;
use App\Http\Requests\Voucher\StorePaymentVoucherRequest;
use App\Http\Requests\Voucher\StoreReceiptVoucherRequest;
use App\Http\Requests\Voucher\StoreRefundVoucherRequest;
use App\Http\Resources\AccountResource;
use App\Http\Resources\VoucherResource;
use App\Models\Account;
use App\Models\BusinessPartner;
use App\Models\PostingRule;
use App\Models\Voucher;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;

class VoucherController extends Controller
{
    public function createExpense(Request $request): Response
    {
        $search = $request->query('search');
        $status = $request->query('status');

        // Get allowed expense accounts from rules
        $rules = PostingRule::query()->where('document_type', 'App\Models\ExpenseVoucher')
            ->where('event', 'created')
            ->where('is_active', true)
            ->with('accounts')
            ->get();

        $debitAccounts = $rules->where('type', 'debit')->flatMap->accounts->unique('id');
        $creditAccounts = $rules->where('type', 'credit')->flatMap->accounts->unique('id');

        $contacts = BusinessPartner::query()->get();

        $vouchers = Voucher::query()
            ->with('voucherItems', 'voucherItems.businessPartner', 'voucherItems.account')
            ->where('type', VoucherType::EXPENSE)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('voucher_no', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('total_amount', 'like', "%{$search}%");
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->simplePaginate();

        $voucherStatuses = VoucherStatusType::options();

        return Inertia::render('voucher/expense', [
            'debitAccounts' => AccountResource::collection($debitAccounts),
            'creditAccounts' => AccountResource::collection($creditAccounts),
            'contacts' => $contacts,
            'vouchers' => Inertia::scroll(fn () => VoucherResource::collection($vouchers)),
            'voucherStatuses' => $voucherStatuses,
        ]);
    }

    public function storeExpense(
        StoreExpenseVoucherRequest $request,
        CreateExpenseVoucherAction $createExpenseVoucher
    ): RedirectResponse {
        try {
            $validated = $request->validated();
            $createExpenseVoucher($validated);

            return back()->with('success', 'Expense voucher created successfully.');
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function updateExpense(
        StoreExpenseVoucherRequest $request,
        Voucher $voucher,
        UpdateExpenseVoucherAction $updateExpenseVoucher
    ): RedirectResponse {
        if (! $voucher->isEditable()) {
            return back()->withErrors(['error' => 'This voucher is locked. Unlock it before editing.']);
        }

        try {
            $updateExpenseVoucher($voucher, $request->validated());

            return back()->with('success', 'Expense voucher updated successfully.');
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function createContra(Request $request): Response
    {
        $search = $request->query('search');
        $status = $request->query('status');

        $allAccounts = Account::query()->active()->with('accountType')->get();

        // Contra-vouchers are typically between Cash and Bank accounts
        $rules = PostingRule::query()->where('document_type', 'App\Models\ContraVoucher')
            ->where('event', 'created')
            ->where('is_active', true)
            ->with('accounts')
            ->get();

        $allowedAccounts = $rules->flatMap->accounts->unique('id');

        $vouchers = Voucher::query()
            ->with('voucherItems', 'voucherItems.account')
            ->where('type', VoucherType::CONTRA)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('voucher_no', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('total_amount', 'like', "%{$search}%");
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->simplePaginate();

        $voucherStatuses = VoucherStatusType::options();

        return Inertia::render('voucher/contra', [
            'accounts' => AccountResource::collection($allAccounts),
            'allowedAccounts' => AccountResource::collection($allowedAccounts->isNotEmpty() ? $allowedAccounts : $allAccounts),
            'vouchers' => Inertia::scroll(fn () => VoucherResource::collection($vouchers)),
            'voucherStatuses' => $voucherStatuses,
        ]);
    }

    public function storeContra(
        StoreContraVoucherRequest $request,
        CreateContraVoucherAction $createContraVoucher
    ): RedirectResponse {
        try {
            $validated = $request->validated();
            $createContraVoucher($validated);

            return back()->with('success', 'Contra voucher created successfully.');
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function updateContra(
        StoreContraVoucherRequest $request,
        Voucher $voucher,
        UpdateContraVoucherAction $updateContraVoucher
    ): RedirectResponse {
        if (! $voucher->isEditable()) {
            return back()->withErrors(['error' => 'This voucher is locked. Unlock it before editing.']);
        }

        try {
            $updateContraVoucher($voucher, $request->validated());

            return back()->with('success', 'Contra voucher updated successfully.');
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function createReceipt(Request $request): Response
    {

        $request->validate([
            'search' => ['nullable', 'string'],
            'status' => ['nullable', new Enum(VoucherStatusType::class)],
        ]);

        $search = $request->query('search');
        $status = $request->query('status');

        $rules = PostingRule::query()->where('document_type', 'App\Models\ReceiptVoucher')
            ->where('event', 'created')
            ->where('is_active', true)
            ->with('accounts')
            ->get();

        // Separate Debit (Receive In) and Credit (Account Head) rules
        $debitAccounts = $rules->where('type', 'debit')->flatMap->accounts->unique('id');
        $creditAccounts = $rules->where('type', 'credit')->flatMap->accounts->unique('id');

        $contacts = BusinessPartner::query()->get();

        $vouchers = Voucher::query()
            ->with('voucherItems', 'voucherItems.businessPartner', 'voucherItems.account')
            ->where('type', VoucherType::RECEIPT)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('voucher_no', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('total_amount', 'like', "%{$search}%");
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->simplePaginate();

        $voucherStatuses = VoucherStatusType::options();

        return Inertia::render('voucher/receipt', [
            'debitAccounts' => AccountResource::collection($debitAccounts),
            'creditAccounts' => AccountResource::collection($creditAccounts),
            'contacts' => $contacts,
            'vouchers' => Inertia::scroll(fn () => VoucherResource::collection($vouchers)),
            'voucherStatuses' => $voucherStatuses,
        ]);
    }

    public function storeReceipt(
        StoreReceiptVoucherRequest $request,
        CreateReceiptVoucherAction $createReceiptVoucher
    ): RedirectResponse {
        try {
            $validated = $request->validated();
            $createReceiptVoucher($validated);

            return back()->with('success', 'Receipt voucher created successfully.');
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function updateReceipt(
        StoreReceiptVoucherRequest $request,
        Voucher $voucher,
        UpdateReceiptVoucherAction $updateReceiptVoucher
    ): RedirectResponse {
        if (! $voucher->isEditable()) {
            return back()->withErrors(['error' => 'This voucher is locked. Unlock it before editing.']);
        }

        try {
            $updateReceiptVoucher($voucher, $request->validated());

            return back()->with('success', 'Receipt voucher updated successfully.');
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function createAdvance(Request $request): Response
    {
        $request->validate([
            'search' => ['nullable', 'string'],
            'status' => ['nullable', new Enum(VoucherStatusType::class)],
        ]);

        $search = $request->query('search');
        $status = $request->query('status');

        $rules = PostingRule::query()->where('document_type', 'App\Models\AdvanceVoucher')
            ->where('event', 'created')
            ->where('is_active', true)
            ->with('accounts')
            ->get();

        $contacts = BusinessPartner::query()->get();

        $vouchers = Voucher::query()
            ->with('voucherItems', 'voucherItems.businessPartner', 'voucherItems.account')
            ->where('type', VoucherType::ADVANCE)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('voucher_no', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('total_amount', 'like', "%{$search}%");
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->simplePaginate();

        $voucherStatuses = VoucherStatusType::options();

        return Inertia::render('voucher/advance', [
            'givenAdvanceAccounts' => AccountResource::collection($this->advanceRuleAccounts($rules, 'given', 'debit')),
            'givenCashAccounts' => AccountResource::collection($this->advanceRuleAccounts($rules, 'given', 'credit')),
            'receivedCashAccounts' => AccountResource::collection($this->advanceRuleAccounts($rules, 'received', 'debit')),
            'receivedAdvanceAccounts' => AccountResource::collection($this->advanceRuleAccounts($rules, 'received', 'credit')),
            'contacts' => $contacts,
            'vouchers' => Inertia::scroll(fn () => VoucherResource::collection($vouchers)),
            'voucherStatuses' => $voucherStatuses,
        ]);
    }

    public function storeAdvance(
        StoreAdvanceVoucherRequest $request,
        CreateAdvanceVoucherAction $createAdvanceVoucher
    ): RedirectResponse {
        try {
            $createAdvanceVoucher($request->validated());

            return back()->with('success', 'Advance voucher created successfully.');
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function updateAdvance(
        StoreAdvanceVoucherRequest $request,
        Voucher $voucher,
        UpdateAdvanceVoucherAction $updateAdvanceVoucher
    ): RedirectResponse {
        if (! $voucher->isEditable()) {
            return back()->withErrors(['error' => 'This voucher is locked. Unlock it before editing.']);
        }

        try {
            $updateAdvanceVoucher($voucher, $request->validated());

            return back()->with('success', 'Advance voucher updated successfully.');
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function createRefund(Request $request): Response
    {
        $request->validate([
            'search' => ['nullable', 'string'],
            'status' => ['nullable', new Enum(VoucherStatusType::class)],
        ]);

        $search = $request->query('search');
        $status = $request->query('status');

        $rules = PostingRule::query()->where('document_type', 'App\Models\RefundVoucher')
            ->where('event', 'created')
            ->where('is_active', true)
            ->with('accounts')
            ->get();

        $debitAccounts = $rules->where('type', 'debit')->flatMap->accounts->unique('id');
        $creditAccounts = $rules->where('type', 'credit')->flatMap->accounts->unique('id');

        $contacts = BusinessPartner::query()->get();

        $vouchers = Voucher::query()
            ->with('voucherItems', 'voucherItems.businessPartner', 'voucherItems.account')
            ->where('type', VoucherType::REFUND)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('voucher_no', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('total_amount', 'like', "%{$search}%");
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->simplePaginate();

        $voucherStatuses = VoucherStatusType::options();

        return Inertia::render('voucher/refund', [
            'debitAccounts' => AccountResource::collection($debitAccounts),
            'creditAccounts' => AccountResource::collection($creditAccounts),
            'contacts' => $contacts,
            'vouchers' => Inertia::scroll(fn () => VoucherResource::collection($vouchers)),
            'voucherStatuses' => $voucherStatuses,
        ]);
    }

    public function storeRefund(
        StoreRefundVoucherRequest $request,
        CreateRefundVoucherAction $createRefundVoucher
    ): RedirectResponse {
        try {
            $createRefundVoucher($request->validated());

            return back()->with('success', 'Refund voucher created successfully.');
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function updateRefund(
        StoreRefundVoucherRequest $request,
        Voucher $voucher,
        UpdateRefundVoucherAction $updateRefundVoucher
    ): RedirectResponse {
        if (! $voucher->isEditable()) {
            return back()->withErrors(['error' => 'This voucher is locked. Unlock it before editing.']);
        }

        try {
            $updateRefundVoucher($voucher, $request->validated());

            return back()->with('success', 'Refund voucher updated successfully.');
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function createPayment(Request $request): Response
    {
        $search = $request->query('search');
        $status = $request->query('status');

        $rules = PostingRule::query()->where('document_type', 'App\Models\PaymentVoucher')
            ->where('event', 'created')
            ->where('is_active', true)
            ->with('accounts')
            ->get();

        $debitAccounts = $rules->where('type', 'debit')->flatMap->accounts->unique('id');
        $creditAccounts = $rules->where('type', 'credit')->flatMap->accounts->unique('id');

        $contacts = BusinessPartner::query()->get();

        $vouchers = Voucher::query()
            ->with('voucherItems', 'voucherItems.businessPartner', 'voucherItems.account')
            ->where('type', VoucherType::PAYMENT)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('voucher_no', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('total_amount', 'like', "%{$search}%");
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->simplePaginate();

        $voucherStatuses = VoucherStatusType::options();

        return Inertia::render('voucher/payment', [
            'debitAccounts' => AccountResource::collection($debitAccounts),
            'creditAccounts' => AccountResource::collection($creditAccounts),
            'contacts' => $contacts,
            'vouchers' => Inertia::scroll(fn () => VoucherResource::collection($vouchers)),
            'voucherStatuses' => $voucherStatuses,
        ]);
    }

    public function storePayment(
        StorePaymentVoucherRequest $request,
        CreatePaymentVoucherAction $createPaymentVoucher
    ): RedirectResponse {
        try {
            $validated = $request->validated();
            $createPaymentVoucher($validated);

            return back()->with('success', 'Payment voucher created successfully.');
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function updatePayment(
        StorePaymentVoucherRequest $request,
        Voucher $voucher,
        UpdatePaymentVoucherAction $updatePaymentVoucher
    ): RedirectResponse {
        if (! $voucher->isEditable()) {
            return back()->withErrors(['error' => 'This voucher is locked. Unlock it before editing.']);
        }

        try {
            $updatePaymentVoucher($voucher, $request->validated());

            return back()->with('success', 'Payment voucher updated successfully.');
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function createJournal(Request $request): Response
    {
        $search = $request->query('search');
        $status = $request->query('status');
        $allAccounts = Account::query()->active()->with('accountType')->get();

        $rules = PostingRule::query()->where('document_type', 'App\Models\JournalVoucher')
            ->where('event', 'created')
            ->where('is_active', true)
            ->with('accounts')
            ->get();

        $debitAccounts = $rules->where('type', 'debit')->flatMap->accounts->unique('id');
        $creditAccounts = $rules->where('type', 'credit')->flatMap->accounts->unique('id');

        $contacts = BusinessPartner::query()->get();

        $vouchers = Voucher::query()
            ->with('voucherItems', 'voucherItems.businessPartner', 'voucherItems.account')
            ->where('type', VoucherType::JOURNAL)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('voucher_no', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('total_amount', 'like', "%{$search}%");
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->simplePaginate();

        $voucherStatuses = VoucherStatusType::options();

        return Inertia::render('voucher/journal', [
            'accounts' => AccountResource::collection($allAccounts),
            'debitAccounts' => AccountResource::collection($debitAccounts->isNotEmpty() ? $debitAccounts : $allAccounts),
            'creditAccounts' => AccountResource::collection($creditAccounts->isNotEmpty() ? $creditAccounts : $allAccounts),
            'contacts' => $contacts,
            'vouchers' => Inertia::scroll(fn () => VoucherResource::collection($vouchers)),
            'voucherStatuses' => $voucherStatuses,
        ]);
    }

    public function storeJournal(
        StoreJournalVoucherRequest $request,
        CreateJournalVoucherAction $createJournalVoucher
    ): RedirectResponse {
        try {
            $validated = $request->validated();
            $createJournalVoucher($validated);

            return back()->with('success', 'Journal voucher created successfully.');
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function updateJournal(
        StoreJournalVoucherRequest $request,
        Voucher $voucher,
        UpdateJournalVoucherAction $updateJournalVoucher
    ): RedirectResponse {
        if (! $voucher->isEditable()) {
            return back()->withErrors(['error' => 'This voucher is locked. Unlock it before editing.']);
        }

        try {
            $updateJournalVoucher($voucher, $request->validated());

            return back()->with('success', 'Journal voucher updated successfully.');
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function approve(Voucher $voucher, ApproveVoucherAction $approveVoucher): RedirectResponse
    {
        try {
            $approveVoucher($voucher);

            return back();
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function void(Voucher $voucher, VoidVoucherAction $voidVoucher): RedirectResponse
    {
        try {
            $voidVoucher($voucher);

            return back();
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function destroy(Voucher $voucher, VoidVoucherAction $voidVoucher): RedirectResponse
    {
        try {
            if ($voucher->status === VoucherStatusType::DRAFT) {
                $voucher->delete();

                return back()->with('success', 'Draft voucher deleted successfully.');
            }

            $voidVoucher($voucher);

            return back();
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function lock(Voucher $voucher, LockVoucherAction $lockVoucher): RedirectResponse
    {
        try {
            $lockVoucher($voucher);

            return back();
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function unlock(Voucher $voucher, UnlockVoucherAction $unlockVoucher): RedirectResponse
    {
        try {
            $unlockVoucher($voucher);

            return back();
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    private function advanceRuleAccounts(Collection $rules, string $advanceType, string $entryType): EloquentCollection
    {
        $accountIds = $rules
            ->filter(fn (PostingRule $rule): bool => data_get($rule->conditions, 'advance_type') === $advanceType)
            ->where('type', $entryType)
            ->flatMap->accounts
            ->pluck('id')
            ->unique()
            ->values();

        return Account::query()
            ->active()
            ->with('accountType')
            ->whereIn('id', $accountIds)
            ->get();
    }
}
