<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusinessPartnerable extends Model
{
    protected $table = 'business_partnerables';

    public $timestamps = false;

    protected $fillable = [
        'business_partner_id',
        'partnerable_id',
        'partnerable_type',
    ];

    public function businessPartner()
    {
        return $this->belongsTo(BusinessPartner::class);
    }

    public function partnerable()
    {
        return $this->morphTo();
    }
}
