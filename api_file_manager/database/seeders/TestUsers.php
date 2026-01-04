<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TestUsers extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        User::factory()
            ->count(20)
            ->sequence(fn ($sequence) => ['email' => 'user' . $sequence->index . '@filemanager.net'])
            ->create([
                'rol_id' => 3,
                'password' => bcrypt('user')
            ]);
    }
}
