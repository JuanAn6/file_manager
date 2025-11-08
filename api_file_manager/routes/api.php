<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('jwt')->group(function () { //Auth routes
        
        //FILES AND DIRECTORIS
        Route::post('/get_home', [HomeController::class, 'getHome']);

        //USER
        Route::get('/user', [AuthController::class, 'getUser']);
        Route::put('/user', [AuthController::class, 'updateUser']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
    
});