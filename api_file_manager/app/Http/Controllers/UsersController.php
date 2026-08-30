<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UsersController extends Controller
{
    public function getList(Request $request)
    {
        $validated = $request->validate([
            'page' => 'nullable|integer|min:1',
            'pageSize' => 'nullable|integer|min:1|max:100',
            'q' => 'nullable|string|max:255',
        ]);

        $query = User::with('role')->orderBy('id');

        if (!empty($validated['q'])) {
            $term = '%' . str_replace(['\\', '%', '_'], ['\\\\', '\%', '\_'], $validated['q']) . '%';
            $query->where(function ($inner) use ($term) {
                $inner->where('name', 'like', $term)
                    ->orWhere('last_name', 'like', $term)
                    ->orWhere('email', 'like', $term);
            });
        }

        // Defaults, so a request without params no longer blows up on a missing key.
        $list = $query->paginate($validated['pageSize'] ?? 10, ['*'], 'page', $validated['page'] ?? 1);

        return response()->json($list);
    }

    public function getUser(Request $request)
    {
        return response()->json([
            'user' => Auth::user(),
        ]);
    }

    /**
     * A single user, for the administration screen.
     */
    public function getById($id)
    {
        $user = User::with('role')->find($id);

        if ($user === null) {
            return response()->json(['error' => 'User not found.'], 404);
        }

        return response()->json(['user' => $user]);
    }

    /**
     * Administrative edit of another user.
     */
    public function updateById(Request $request, $id)
    {
        $user = User::find($id);

        if ($user === null) {
            return response()->json(['error' => 'User not found.'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'rol_id' => 'required|integer|exists:rols,id',
        ]);

        $user->name = $validated['name'];
        $user->last_name = $validated['last_name'] ?? null;
        $user->email = $validated['email'];
        $user->rol_id = $validated['rol_id'];
        $user->save();

        return response()->json(['status' => 'success', 'user' => $user->load('role')]);
    }

    /**
     * The role list the administration form offers.
     */
    public function getRoles()
    {
        return response()->json(['roles' => Rol::orderBy('id')->get()]);
    }

    public function updateProfileImage(Request $request)
    {
        $user = Auth::user();
        $userdb = User::find($user->id);

        // The front-end sends the string 'null' through FormData to clear it;
        // an empty value is accepted too so neither side has to guess.
        $submitted = $request->input('profile_img');
        if (!$request->hasFile('profile_img') && ($submitted === 'null' || $submitted === '' || $submitted === null)) {
            if ($userdb->profile_img) {
                Storage::disk()->delete($userdb->profile_img);
                $userdb->profile_img = null;
                $userdb->save();
            }

            return response()->json(['status' => 'cleared']);
        }

        $request->validate([
            'profile_img' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        //Remove previous image if exists
        if ($userdb->profile_img) {
            Storage::disk()->delete($userdb->profile_img);
        }

        $path = $request->file('profile_img')->store('profiles/' . $userdb->id);

        $userdb->profile_img = $path;
        $userdb->save();

        return response()->json([
            'message' => 'Image updated successfully',
            'path' => Storage::url($path),
        ], 200);
    }

    public function getProfileImage(Request $request)
    {
        $user = Auth::user();

        if (!$user->profile_img) {
            return response()->json(['profile_img' => null]);
        }

        if (!Storage::exists($user->profile_img)) {
            abort(404);
        }

        return response()->file(Storage::path($user->profile_img));
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
        ]);

        $userdb = User::find(Auth::user()->id);
        $userdb->name = $validated['name'];
        $userdb->last_name = $validated['last_name'] ?? null;
        $userdb->save();

        return response()->json(['status' => 'success', 'user' => $userdb]);
    }
}
