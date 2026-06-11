<?php

namespace App\Http\Controllers;

use App\Actions\BusinessPartner\CreateBusinessPartnerAction;
use App\Actions\BusinessPartner\UpdateBusinessPartnerAction;
use App\Enums\PartnerableModelType;
use App\Http\Controllers\Controller;
use App\Http\Requests\BusinessPartner\StoreBusinessPartnerRequest;
use App\Http\Requests\BusinessPartner\UpdateBusinessPartnerRequest;
use App\Http\Resources\BusinessPartnerResource;
use App\Models\Account;
use App\Models\BusinessPartner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BusinessPartnerController extends Controller
{
    public function index(Request $request): Response
    {
        $request->validate(['search' => 'nullable|string']);
        $search = $request->query('search');

        $query = BusinessPartner::query()->with(['suppliers', 'partnerables']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%')
                    ->orWhere('phone', 'like', '%' . $search . '%');
            });
        }

        $partners = BusinessPartnerResource::collection($query->latest()->paginate(15));

        return Inertia::render('business-partner/index', [
            'partners' => $partners,
            'filters' => $request->only('search'),
        ]);
    }

    public function create(Request $request): Response
    {
        $accounts = Account::query()->active()->get(['id', 'name', 'code']);
        $partnerableTypes = PartnerableModelType::options();

        $items = [];
        if ($request->has('model')) {
            $model = $request->get('model');
            $enum = PartnerableModelType::tryFrom($model);
            $items = $enum ? $enum->allItems() : [];
        }

        return Inertia::render('business-partner/create', [
            'accounts' => $accounts,
            'partnerableTypes' => $partnerableTypes,
            'items' => $items,
        ]);
    }

    public function store(StoreBusinessPartnerRequest $request, CreateBusinessPartnerAction $createAction): RedirectResponse
    {
        try {
            $validated = $request->validated();
            $createAction($validated, $request);

            return to_route('business-partners.index')->with('success', 'Business Partner created successfully.');
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function edit(Request $request, BusinessPartner $businessPartner): Response
    {
        $businessPartner->load(['suppliers', 'partnerables']);
        $accounts = Account::query()->active()->get(['id', 'name', 'code']);
        $partnerableTypes = PartnerableModelType::options();

        // Determine current type and id from linked suppliers (simplified to first one)
        $currentSupplier = $businessPartner->suppliers->first();
        $currentType = $currentSupplier ? PartnerableModelType::Supplier->value : null;

        $items = [];
        $selectedModel = $request->get('model', $currentType);
        if ($selectedModel) {
            $enum = PartnerableModelType::tryFrom($selectedModel);
            $items = $enum ? $enum->allItems() : [];
        }

        return Inertia::render('business-partner/edit', [
            'partner' => BusinessPartnerResource::make($businessPartner),
            'accounts' => $accounts,
            'partnerableTypes' => $partnerableTypes,
            'items' => $items,
        ]);
    }

    public function update(
        UpdateBusinessPartnerRequest $request,
        BusinessPartner $businessPartner,
        UpdateBusinessPartnerAction $updateAction
    ): RedirectResponse {
        try {
            $validated = $request->validated();
            $updateAction($validated, $businessPartner, $request);

            return to_route('business-partners.index')->with('success', 'Business Partner updated successfully.');
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }

    public function destroy(BusinessPartner $businessPartner): RedirectResponse
    {
        try {
            $businessPartner->delete($businessPartner);

            return to_route('business-partners.index')->with('success', 'Business Partner deleted successfully.');
        } catch (\Throwable $t) {
            return back()->withErrors(['error' => $t->getMessage()]);
        }
    }
}
