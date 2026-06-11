<?php

namespace App\Enums\CA;

enum AccountSubType: string
{
    case GENERAL = 'general';
    case CASH = 'cash';
    case BANK_ACCOUNT = 'bank_account';
    case MOBILE_BANKING = 'mobile_banking';
    case OTHER = 'other';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function options(): array
    {
        return array_map(fn ($case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], self::cases());
    }

    public function label(): string
    {
        return match ($this) {
            self::GENERAL => 'General',
            self::CASH => 'Cash',
            self::BANK_ACCOUNT => 'Bank Account',
            self::MOBILE_BANKING => 'Mobile Banking',
            self::OTHER => 'Other',
        };
    }
}
