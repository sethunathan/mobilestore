<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/companies', function () {
    
    return view('company-master');
});

Auth::routes();

Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');

Route::get('/company', [App\Http\Controllers\HomeController::class, 'company'])->name('company');


Route::get('/company2', [App\Http\Controllers\HomeController::class, 'company2'])->name('company2');


Route::get('/company/create', [App\Http\Controllers\HomeController::class, 'create_company'])->name('company.create');             