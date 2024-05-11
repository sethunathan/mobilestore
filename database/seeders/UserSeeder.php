<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'test',
            'email' => 'test@gmail.com',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'name' => 'app',
            'email' => 'admin@app.com',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'name' => 'sethu',
            'email' => 'email.sethu@gmail.com',
            'password' => Hash::make('7Qq5-Thd[4A8Od'),
        ]);
    }
}
