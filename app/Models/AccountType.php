<?php

namespace App\Models;

use App\Enums\CA\AccountNatureType;
use App\Traits\DynamicLogActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;

class AccountType extends Model
{
    use DynamicLogActivity, LogsActivity, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'nature',
        'is_active',
    ];

    protected $casts = [
        'nature' => AccountNatureType::class,
        'is_active' => 'boolean',
    ];

    public function accounts(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Account::class);
    }
}
