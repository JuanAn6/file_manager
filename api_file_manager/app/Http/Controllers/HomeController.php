<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use app\Models\Directory;
use app\Models\File;

class HomeController extends Controller
{
    //

    public function getHome(Request $request){

        $user = Auth::user();

        $directories = Directoiry::where('user_id', $user->id)->where('parent_id', null)->get();
        $files = File::where('user_id', $user->id)->where('parent_id', null)->get();

        return response()->json([
            'directories' => $directories,
            'files' => $files,
        ]);

    }
}
