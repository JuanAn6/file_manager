<?php

namespace App\Http\Controllers;

use App\Models\Directory;
use App\Models\File;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Throwable;


class HomeController extends Controller
{
    //

    public function getDirectory(Request $request){
        $data = $request->all();

        $user = Auth::user();
        // dd($data['parent_id']);

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

        $breadcrumbs = [];
        if($parent != null && $parent->parent_id != null){
            $breadcrumbs [] = $parent;
            $this->getBreadcrumbs($breadcrumbs, $parent->parent_id);
        }else if($parent != null){
            $breadcrumbs [] = $parent;
        }

        return response()->json([
            'directories' => $directories,
            'files' => $files,
            'parent' => $parent,
            'breadcrumbs' => $breadcrumbs,
        ]);

    }

    /**
     * Recursive function that returns all the parent folders to the main one
     */
    public function getBreadcrumbs(&$folders, $currentFolderId){
        $folder = Directory::find($currentFolderId);
        if($folder != null && $folder->parent_id != null){
            $folders [] = $folder;
            $this->getBreadcrumbs($folders, $folder->parent_id);
        }else if($folder != null){
            $folders [] = $folder;
        }
    }

    public function createNewFolder (Request $request){
        try{
            $data = $request->all();
            
            $newFolder = Directory::create([
                'user_id' => Auth::user()->id,
                'parent_id' => $data['parent_id'],
                'name' => $data['name'],
                'color' => null,
                'icon' => null,
                'items' => 0,
                'size' => 0, 
            ]);

            return response()->json([ 'status' => 1, 'new_folder' => $newFolder ]);
        }catch(Throwable $e){
            //Status 0 means error creating
            return response()->json([ 'status' => 0, 'new_folder' => null ]);
        }
    }

    public function uploadFiles(Request $request){
        $data = $request->all();
        
        return response()->json([
            'data' => $data,
        ]);
    }
}
