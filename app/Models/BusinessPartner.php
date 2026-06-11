<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessPartner extends Model
{

    protected $fillable = [
        'name',
        'email',
        'phone',
        'default_receivable_account_id',
        'default_payable_account_id',
    ];

    public function partnerables()
    {
        return $this->hasMany(BusinessPartnerable::class);
    }

    public function suppliers()
    {
        return $this->morphedByMany(Supplier::class, 'partnerable', 'business_partnerables');
    }

    public function customers()
    {
        return $this->morphedByMany(Customer::class, 'partnerable', 'business_partnerables');
    }

    public function supplier()
    {
        return $this->suppliers()->limit(1);
    }

    public function customer()
    {
        return $this->customers()->limit(1);
    }

    public function receivableAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'default_receivable_account_id');
    }

    public function payableAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'default_payable_account_id');
    }
}
