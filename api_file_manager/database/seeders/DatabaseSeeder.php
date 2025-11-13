<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        Rol::create(['name' => 'superadmin']);
        Rol::create(['name' => 'admin']);
        Rol::create(['name' => 'user']);
        
        User::factory()->create([
            'name' => 'admin',
            'email' => 'admin@filemanager.net',
            'password' => 'admin',
            'rol_id' => 1,
        ]);
        
    }
}
