<?php

namespace App\Http\Controllers;

use App\Models\Directory;
use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class HomeController extends Controller
{
    //

    public function getDirectory(Request $request){
        $data = $request->all();

        $user = Auth::user();
        
        $directories = Directory::with(['user'])
            ->where('user_id', $user->id)
            ->where('parent_id', $data['parent_id'])
            ->get();
        
        $files = File::with(['user'])
            ->where('user_id', $user->id)
            ->where('parent_id', $data['parent_id'])
            ->get();
        
        $parent = Directory::with(['user'])
            ->where('user_id', $user->id)
            ->where('id', $data['parent_id'])
            ->get()
            ->first();

        return response()->json([
            'directories' => $directories,
            'files' => $files,
            'parent' => $parent,
        ]);

    }
}
