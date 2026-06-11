<?php

use App\Enums\CA\VoucherItemType;
use App\Models\Account;
use App\Models\BusinessPartner;
use App\Models\Voucher;
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
        Schema::create('voucher_items', function (Blueprint $table) {
            $table->id();

            $table->foreignIdFor(Voucher::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Account::class)->constrained();

            $table->foreignIdFor(BusinessPartner::class)->nullable()
                ->constrained();

            $table->enum('type', VoucherItemType::values());
            $table->decimal('amount', 15, 2);

            $table->text('remarks')->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voucher_items');
    }
};
