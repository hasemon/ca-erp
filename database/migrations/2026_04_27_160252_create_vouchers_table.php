<?php

use App\Enums\CA\VoucherStatusType;
use App\Enums\CA\VoucherType;
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
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();

            $table->string('voucher_no')->unique();
            $table->timestamp('date_time')->default(now());

            $table->string('type')->comment('List of '.implode(', ', VoucherType::values()));
            $table->string('account_number')->nullable();

            $table->decimal('total_amount', 15, 2);

            $table->text('description')->nullable();
            $table->json('data')->nullable();

            $table->string('status')->default(VoucherStatusType::DRAFT->value);

            $table->boolean('is_locked')->default(false);

            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
