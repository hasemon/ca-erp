<?php

use App\Enums\CA\TransactionType;
use App\Models\Account;
use App\Models\BusinessPartner;
use App\Models\TransactionGroup;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            $table->foreignIdFor(TransactionGroup::class)->constrained()->cascadeOnDelete();

            $table->foreignIdFor(Account::class)->constrained()->cascadeOnDelete();

            $table->foreignIdFor(BusinessPartner::class)->nullable()->constrained();

            $table->enum('type', TransactionType::values());
            $table->decimal('amount', 15, 2);

            $table->text('description')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
