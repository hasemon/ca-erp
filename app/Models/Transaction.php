<?php

namespace App\Models;

use App\Enums\CA\TransactionType;
use App\Traits\DynamicLogActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;

class Transaction extends Model
{
    use DynamicLogActivity, LogsActivity;

    protected $fillable = [
        'transaction_group_id',
        'account_id',
        'business_partner_id',
        'type',
        'amount',
        'description',
    ];

    protected $casts = [
        'type' => TransactionType::class,
        'amount' => 'decimal:2',
    ];

    public function transactionGroup(): BelongsTo
    {
        return $this->belongsTo(TransactionGroup::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function businessPartner(): BelongsTo
    {
        return $this->belongsTo(BusinessPartner::class);
    }
}
