<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

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
        return response()->json([
            'user' => $user,
        ]);
    }

    public function updateProfileImage(Request $request){
        //Create folder if not exists and save image
        $request->validate([
            'profile_img' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = Auth::user(); // Obtener el usuario autenticado

        if ($request->hasFile('profile_img')) {
            
            //Remove previous image if exists
            if ($user->profile_img) {
                Storage::disk()->delete($user->profile_img);
            }

            $path = $request->file('profile_img')->store('profiles/'.$user->id);

            $user->profile_img = $path;
            $user->save();

            return response()->json([
                'message' => 'Imagen updated successfuly',
                'path' => Storage::url($path)
            ], 200);
        }

        return response()->json(['error' => 'No se recibió ninguna imagen'], 400);

    }

    public function getProfileImage(Request $request){
        $user = Auth::user();

        if (!$user->profile_img || !Storage::exists($user->profile_img)) {
            abort(404);
        }
        
        $file = storage_path('app/private/' . $user->profile_img);

        return response()->file($file);
    }

    public function updateProfile(Request $request){
        
        $data = $request->all();

        $auth = Auth::user();

        $userdb = User::find($auth->id);
        $userdb->name = $data['name'];
        $userdb->last_name = $data['last_name'];
        $userdb->save();

        return response()->json(['status' => 'success', 'user' => $userdb]);
    }
}
