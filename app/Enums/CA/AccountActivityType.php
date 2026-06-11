<?php

namespace App\Enums\CA;

enum AccountActivityType: string
{
    case NONE = 'none';
    case OPERATING_ACTIVITIES = 'operating_activities';
    case INVESTING_ACTIVITIES = 'investing_activities';
    case FINANCING_ACTIVITIES = 'financing_activities';

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
            self::NONE => 'None',
            self::OPERATING_ACTIVITIES => 'Operating Activities',
            self::INVESTING_ACTIVITIES => 'Investing Activities',
            self::FINANCING_ACTIVITIES => 'Financing Activities',
        };
    }
}
