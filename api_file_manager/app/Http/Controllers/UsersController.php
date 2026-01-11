<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UsersController extends Controller
{
    //


    public function getList(Request $request){
        
        $params = $request->all();
        $list = User::paginate($params['pageSize'], ['*'], 'page', $params['page']);
        return response()->json($list);
    }

    public function getUser(Request $request){
        $user = Auth::user();
        //Get profile image
        return response()->json([
            'user' => $user,
            'profile_img' => null,
        ]);
    }

    public function updateProfile(Request $request){
        //Create folder if not exists and save image
        
        dd($request);
    }
}
