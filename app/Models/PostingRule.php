<?php

namespace App\Models;

use App\Traits\DynamicLogActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Activitylog\Traits\LogsActivity;

class PostingRule extends Model
{
    use DynamicLogActivity, LogsActivity;

    protected $fillable = [
        'document_type',
        'event',
        'name',
        'description',
        'type',
        'amount_field',
        'is_dynamic',
        'dynamic_key',
        'is_optional',
        'conditions',
        'order',
        'is_system',
        'is_active',
    ];

    protected $casts = [
        'is_dynamic' => 'boolean',
        'is_optional' => 'boolean',
        'conditions' => 'array',
        'is_system' => 'boolean',
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * The accounts associated with this posting rule.
     */
    public function accounts(): BelongsToMany
    {
        return $this->belongsToMany(Account::class, 'posting_rule_accounts');
    }
}
