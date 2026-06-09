<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('town_statistics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('town_info_id')->constrained('town_info')->onDelete('cascade');
            $table->string('label', 255);
            $table->string('value', 255);
            $table->unsignedInteger('sort_order')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('town_statistics');
    }
};
