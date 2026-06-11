<?php

use App\Enums\CA\AccountActivityType;
use App\Enums\CA\AccountSubType;
use App\Models\AccountType;
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
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(AccountType::class)->constrained()->restrictOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('accounts')->nullOnDelete();

            $table->string('name');
            $table->string('code')->unique();

            $table->string('sub_type')->nullable()->comment('List of '.implode(', ', AccountSubType::values()));
            $table->string('activity_type')->nullable()->comment('List of '.implode(', ', AccountActivityType::values()));
            $table->string('account_number')->nullable();

            $table->boolean('is_group')->default(false);
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);

            $table->text('description')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
