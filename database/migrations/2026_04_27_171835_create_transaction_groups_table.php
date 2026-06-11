<?php

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
        Schema::create('transaction_groups', function (Blueprint $table) {
            $table->id();

            $table->uuid('txn_id')->unique();

            $table->timestamp('date_time');

            $table->morphs('source'); // invoice, voucher etc

            $table->string('reference')->nullable();
            $table->text('description')->nullable();

            $table->boolean('is_reversal')->default(false);
            $table->foreignId('reversal_of')->nullable()->constrained('transaction_groups');

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
        Schema::dropIfExists('transaction_groups');
    }
};
