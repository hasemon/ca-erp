<?php

namespace App\Enums\CA;

enum VoucherType: string
{
    case RECEIPT = 'receipt';
    case PAYMENT = 'payment';
    case JOURNAL = 'journal';
    case CONTRA = 'contra';
    case EXPENSE = 'expense';
    case SALARY = 'salary';
    case ADVANCE = 'advance';
    case REFUND = 'refund';

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
            self::RECEIPT => 'Receipt',
            self::PAYMENT => 'Payment',
            self::JOURNAL => 'Journal',
            self::CONTRA => 'Contra',
            self::EXPENSE => 'Expense',
            self::SALARY => 'Salary',
            self::ADVANCE => 'Advance',
            self::REFUND => 'Refund',
        };
    }
}
