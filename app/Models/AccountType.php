<?php

namespace App\Models;

use App\Enums\CA\AccountNatureType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AccountType extends Model
{
    use SoftDeletes;

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
