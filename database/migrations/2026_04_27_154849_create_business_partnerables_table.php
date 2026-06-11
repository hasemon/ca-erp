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
        Schema::create('business_partnerables', function (Blueprint $table) {
            $table->foreignId('business_partner_id')->constrained()->cascadeOnDelete();
            $table->morphs('partnerable'); // partnerable_id, partnerable_type

            $table->unique(['business_partner_id', 'partnerable_id', 'partnerable_type'], 'bp_partnerable_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_partnerables');
    }
};
