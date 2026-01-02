<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UsersController extends Controller
{
    //


    public function getList(Request $request){
        
        $list = User::paginate(10);
        return response()->json($list);
    }
}
