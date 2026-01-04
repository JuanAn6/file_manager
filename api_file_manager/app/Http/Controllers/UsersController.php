<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UsersController extends Controller
{
    //


    public function getList(Request $request){
        
        $params = $request->all();
        $list = User::paginate($params['pageSize'], ['*'], 'page', $params['page']);
        return response()->json($list);
    }
}
