<?php

namespace App\Http\Controllers;

use App\Enums\CA\TransactionType;
use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $request->validate([
            'search' => ['nullable', 'string'],
            'type' => ['nullable', 'string'],
            'date_start' => ['nullable', 'date'],
            'date_end' => ['nullable', 'date'],
        ]);

        $search = $request->query('search');
        $type = $request->query('type');
        $dateStart = $request->query('date_start');
        $dateEnd = $request->query('date_end');

        $query = Transaction::query()
            ->with(['account', 'transactionGroup', 'businessPartner'])
            ->latest();

        if ($type) {
            $types = explode(',', $type);
            $query->whereIn('type', $types);
        }

        if ($dateStart) {
            $query->whereHas('transactionGroup', function ($q) use ($dateStart) {
                $q->whereDate('date_time', '>=', $dateStart);
            });
        }

        if ($dateEnd) {
            $query->whereHas('transactionGroup', function ($q) use ($dateEnd) {
                $q->whereDate('date_time', '<=', $dateEnd);
            });
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhereHas('transactionGroup', function ($q2) use ($search) {
                        $q2->where('reference', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%");
                    });
            });
        }

        // Calculate totals for the current filtered query
        $totalDebit = (clone $query)->where('type', TransactionType::DEBIT->value)->sum('amount');
        $totalCredit = (clone $query)->where('type', TransactionType::CREDIT->value)->sum('amount');
        $netBalance = abs($totalDebit - $totalCredit);

        $transactions = TransactionResource::collection(
            $query->paginate(15)->withQueryString()
        );

        return Inertia::render('transaction/index', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'type', 'date_start', 'date_end']),
            'summary' => [
                'total_debit' => (string) $totalDebit,
                'total_credit' => (string) $totalCredit,
                'net_balance' => (string) $netBalance,
            ],
        ]);
    }
}
