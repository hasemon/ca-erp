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
        Schema::create('posting_rules', function (Blueprint $table) {
            $table->id();

            $table->string('document_type'); // e.g. App\Models\Invoice
            $table->string('event');         // e.g. created, paid

            $table->string('name')->nullable();
            $table->string('description')->nullable();

            $table->string('type'); // debit / credit
            $table->string('amount_field');

            $table->boolean('is_dynamic')->default(false);
            $table->string('dynamic_key')->nullable();

            $table->boolean('is_optional')->default(false);
            $table->json('conditions')->nullable();

            $table->integer('order')->default(0);
            $table->boolean('is_system')->default(true);
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });

        Schema::create('posting_rule_accounts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('posting_rule_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('account_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posting_rule_accounts');
        Schema::dropIfExists('posting_rules');
    }
};
