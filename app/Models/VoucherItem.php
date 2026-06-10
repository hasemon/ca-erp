<?php

namespace App\Models;

use App\Enums\CA\VoucherItemType;
use App\Traits\DynamicLogActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;

class VoucherItem extends Model
{
    use DynamicLogActivity, LogsActivity, SoftDeletes;

    protected $fillable = [
        'voucher_id',
        'account_id',
        'business_partner_id',
        'type',
        'amount',
        'remarks',
    ];

    protected $casts = [
        'type' => VoucherItemType::class,
        'amount' => 'decimal:2',
    ];

    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function businessPartner()
    {
        return $this->belongsTo(BusinessPartner::class);
    }
}
