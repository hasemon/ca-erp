<?php

namespace App\Models;

use App\Traits\DynamicLogActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Spatie\Activitylog\Traits\LogsActivity;

class TransactionGroup extends Model
{
    use DynamicLogActivity, LogsActivity;

    protected $fillable = [
        'txn_id',
        'date_time',
        'source_type',
        'source_id',
        'reference',
        'description',
        'is_reversal',
        'reversal_of',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'date_time' => 'datetime',
        'is_reversal' => 'boolean',
    ];

    public function source(): MorphTo
    {
        return $this->morphTo();
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function reversalOf(): BelongsTo
    {
        return $this->belongsTo(__CLASS__, 'reversal_of');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function stockAdjustments(): HasMany
    {
        return $this->hasMany(StockAdjustment::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }
}
