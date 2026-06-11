<?php

namespace Database\Seeders;

use App\Enums\CA\AccountNatureType;
use App\Models\AccountType;
use Illuminate\Database\Seeder;

class AccountTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            ['name' => 'Asset', 'code' => 'ASSET', 'nature' => AccountNatureType::DEBIT],
            ['name' => 'Liability', 'code' => 'LIABILITY', 'nature' => AccountNatureType::CREDIT],
            ['name' => 'Equity', 'code' => 'EQUITY', 'nature' => AccountNatureType::CREDIT],
            ['name' => 'Income', 'code' => 'INCOME', 'nature' => AccountNatureType::CREDIT],
            ['name' => 'Expense', 'code' => 'EXPENSE', 'nature' => AccountNatureType::DEBIT],
        ];

        foreach ($types as $type) {
            AccountType::firstOrCreate(
                ['code' => $type['code']],
                $type
            );
        }
    }
}
