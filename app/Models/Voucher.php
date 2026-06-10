<?php

namespace App\Models;

use App\Enums\CA\VoucherStatusType;
use App\Enums\CA\VoucherType;
use App\Traits\DynamicLogActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;

class Voucher extends Model
{
    use DynamicLogActivity, LogsActivity, SoftDeletes;

    protected $fillable = [
        'voucher_no',
        'date_time',
        'type',
        'account_number',
        'total_amount',
        'description',
        'data',
        'status',
        'is_locked',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'date_time' => 'datetime',
        'type' => VoucherType::class,
        'status' => VoucherStatusType::class,
        'total_amount' => 'decimal:2',
        'data' => 'array',
        'is_locked' => 'boolean',
    ];

    public function isEditable(): bool
    {
        return $this->status === VoucherStatusType::DRAFT
            || ($this->status === VoucherStatusType::APPROVED && ! $this->is_locked);
    }

    public function voucherItems()
    {
        return $this->hasMany(VoucherItem::class);
    }

    public function transactionGroups()
    {
        return $this->morphMany(TransactionGroup::class, 'source');
    }

    public function postedTransactionGroup()
    {
        return $this->morphOne(TransactionGroup::class, 'source')->where('is_reversal', false)->latestOfMany();
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
