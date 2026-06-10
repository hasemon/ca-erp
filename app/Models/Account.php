<?php

namespace App\Models;

use App\Enums\CA\AccountActivityType;
use App\Enums\CA\AccountNatureType;
use App\Enums\CA\AccountSubType;
use App\Traits\DynamicLogActivity;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Traits\LogsActivity;

class Account extends Model
{
    use DynamicLogActivity, LogsActivity;

    protected $fillable = [
        'account_type_id',
        'parent_id',
        'name',
        'code',
        'sub_type',
        'activity_type',
        'account_number',
        'is_group',
        'is_system',
        'is_active',
        'description',
    ];

    protected $casts = [
        'sub_type' => AccountSubType::class,
        'activity_type' => AccountActivityType::class,
        'is_group' => 'boolean',
        'is_system' => 'boolean',
        'is_active' => 'boolean',
    ];

    #[Scope]
    public function active()
    {
        return $this->where('is_active', true);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(__CLASS__, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(__CLASS__, 'parent_id');
    }

    public function accountType(): BelongsTo
    {
        return $this->belongsTo(AccountType::class);
    }

    public function voucherItems(): HasMany
    {
        return $this->hasMany(VoucherItem::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function getBalanceAttribute()
    {
        return $this->getBalanceForPeriod();
    }

    public function getBalanceForPeriod(?Carbon $start = null, ?Carbon $end = null): float
    {
        $query = $this->transactions();

        if ($start) {
            $query->whereHas('transactionGroup', fn ($q) => $q->whereDate('date_time', '>=', $start));
        }

        if ($end) {
            $query->whereHas('transactionGroup', fn ($q) => $q->whereDate('date_time', '<=', $end));
        }

        $debits = (clone $query)->where('type', \App\Enums\CA\TransactionType::DEBIT)->sum('amount');
        $credits = (clone $query)->where('type', \App\Enums\CA\TransactionType::CREDIT)->sum('amount');

        $nature = $this->accountType?->nature;

        if ($nature === AccountNatureType::DEBIT) {
            $balance = $debits - $credits;
        } else {
            $balance = $credits - $debits;
        }

        // Aggregate child balances recursively
        foreach ($this->children as $child) {
            $balance += $child->getBalanceForPeriod($start, $end);
        }

        return (float) $balance;
    }

    public function businessPartners(): BelongsToMany
    {
        return $this->belongsToMany(BusinessPartner::class, 'business_partner_account');
    }
}
