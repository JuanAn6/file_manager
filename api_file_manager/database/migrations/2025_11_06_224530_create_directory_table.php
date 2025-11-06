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
        Schema::create('directory', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('name', 1024);
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('color', 30)->nullable();
            $table->string('icon', 256)->nullable();
            //$table->integer('items') Number of items inside.
            //$table->integer('size') size of the folder, and all the items.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('directory');
    }
};
