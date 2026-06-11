<?php

namespace App\Enums\CA;

enum VoucherStatusType: string
{
    case DRAFT = 'draft';
    case APPROVED = 'approved';
    case VOID = 'void';

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
            self::DRAFT => 'Draft',
            self::APPROVED => 'Approved',
            self::VOID => 'Void',
        };
    }
}
