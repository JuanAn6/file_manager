<?php

namespace App\Http\Controllers;

use App\Models\Directory;
use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;


class HomeController extends Controller
{
    /** Item types shared with the front-end. */
    private const TYPE_DIRECTORY = 1;
    private const TYPE_FILE = 2;

    /** The disk uploaded files live on. Must match uploadFiles(). */
    private const FILES_DISK = 'public';

    /**
     * The sections the navigation offers, resolved against the stored mime type
     * with the extension as a fallback for files uploaded without one.
     */
    private const CATEGORIES = [
        'images' => [
            'mimes' => ['image/'],
            'extensions' => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'avif', 'heic'],
        ],
        'videos' => [
            'mimes' => ['video/'],
            'extensions' => ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'flv', 'm4v'],
        ],
        'audios' => [
            'mimes' => ['audio/'],
            'extensions' => ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'],
        ],
        'pdfs' => [
            'mimes' => ['application/pdf'],
            'extensions' => ['pdf'],
        ],
        'documents' => [
            'mimes' => [
                'application/msword',
                'application/vnd.openxmlformats-officedocument',
                'application/vnd.ms-excel',
                'application/vnd.ms-powerpoint',
                'application/vnd.oasis.opendocument',
                'text/',
            ],
            'extensions' => ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp', 'txt', 'csv', 'md', 'rtf'],
        ],
    ];

    public function getDirectory(Request $request)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|integer|exists:directory,id',
        ]);

        $user = Auth::user();
        $parentId = $validated['parent_id'] ?? null;

        $directories = Directory::with(['user'])
            ->where('user_id', $user->id)
            ->where('parent_id', $parentId)
            ->orderBy('name')
            ->get();

        $files = File::with(['user'])
            ->where('user_id', $user->id)
            ->where('parent_id', $parentId)
            ->orderBy('name')
            ->get();

        $parent = $parentId === null ? null : Directory::with(['user'])
            ->where('user_id', $user->id)
            ->where('id', $parentId)
            ->first();

        $breadcrumbs = [];
        if ($parent != null) {
            $breadcrumbs[] = $parent;
            if ($parent->parent_id != null) {
                $this->getBreadcrumbs($breadcrumbs, $parent->parent_id);
            }
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
    public function getBreadcrumbs(&$folders, $currentFolderId)
    {
        $folder = Directory::find($currentFolderId);
        if ($folder != null && $folder->parent_id != null) {
            $folders[] = $folder;
            $this->getBreadcrumbs($folders, $folder->parent_id);
        } else if ($folder != null) {
            $folders[] = $folder;
        }
    }

    public function createNewFolder(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|integer|exists:directory,id',
        ]);

        try {
            $newFolder = Directory::create([
                'user_id' => Auth::user()->id,
                'parent_id' => $validated['parent_id'] ?? null,
                'name' => $validated['name'],
                'color' => null,
                'icon' => null,
                'items' => 0,
                'size' => 0,
            ]);

            return response()->json(['status' => 1, 'new_folder' => $newFolder]);
        } catch (Throwable $e) {
            //Status 0 means error creating
            return response()->json(['status' => 0, 'new_folder' => null], 500);
        }
    }

    public function uploadFiles(Request $request)
    {
        $validated = $request->validate([
            'files' => 'required|array',
            'files.*' => 'required|file',
            'parent_id' => 'nullable|integer|exists:directory,id',
        ]);

        $parentId = $validated['parent_id'] ?? null;
        $userId = Auth::user()->id;
        $path = 'users/' . $userId;

        $newFiles = [];
        foreach ($request->file('files') as $file) {
            $filePath = uniqid() . '.' . $file->getClientOriginalExtension();
            $file->storeAs($path, $filePath, self::FILES_DISK);

            //Save the file in database
            $newFiles[] = File::create([
                'parent_id' => $parentId,
                'user_id' => $userId,
                'name' => $file->getClientOriginalName(),
                'extension' => $file->extension(),
                'size' => $file->getSize(), //bytes
                'path' => $filePath,
                'mime' => $file->getMimeType(),
            ]);
        }

        return response()->json(['files' => $newFiles]);
    }

    /**
     * Stream one stored file back to its owner as an attachment. Ownership is
     * part of the lookup, so another user's id returns 404 instead of a file.
     *
     * The front-end cannot navigate to this route: the JWT travels in a header,
     * which a plain link cannot set, so it fetches the body and saves it itself.
     */
    public function downloadFile(int $id)
    {
        $userId = Auth::user()->id;
        $file = File::where('user_id', $userId)->find($id);

        if ($file === null) {
            return response()->json(['status' => 0, 'error' => 'File not found.'], 404);
        }

        $path = 'users/' . $userId . '/' . $file->path;

        // A row can outlive its blob: deleting from disk happens after the
        // transaction commits, so a failure there leaves the row behind.
        if (!Storage::disk(self::FILES_DISK)->exists($path)) {
            return response()->json(['status' => 0, 'error' => 'The file is missing from storage.'], 404);
        }

        return Storage::disk(self::FILES_DISK)->download($path, $file->name, [
            'Content-Type' => $file->mime ?: 'application/octet-stream',
        ]);
    }

    /**
     * Rename a single file or directory. Ownership is part of the lookup, so a
     * crafted id cannot reach another user's row.
     */
    public function renameItem(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer',
            'type' => 'required|integer|in:' . self::TYPE_DIRECTORY . ',' . self::TYPE_FILE,
            'name' => 'required|string|max:255',
        ]);

        $userId = Auth::user()->id;

        $item = $validated['type'] === self::TYPE_DIRECTORY
            ? Directory::where('user_id', $userId)->find($validated['id'])
            : File::where('user_id', $userId)->find($validated['id']);

        if ($item === null) {
            return response()->json(['status' => 0, 'error' => 'Item not found.'], 404);
        }

        $item->name = $validated['name'];
        $item->save();

        return response()->json(['status' => 1, 'item' => $item]);
    }

    /**
     * Every folder the user owns, flat, with the parent that links them. The
     * front-end assembles the tree; sending it nested would only make the
     * response harder to page through later.
     */
    public function getDirectoryTree()
    {
        $directories = Directory::where('user_id', Auth::user()->id)
            ->orderBy('name')
            ->get(['id', 'parent_id', 'name']);

        return response()->json(['directories' => $directories]);
    }

    /**
     * Move files and directories into another directory (or to the root when
     * target_id is null). This is what a drag and drop in the listing performs.
     */
    public function moveItems(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer',
            'items.*.type' => 'required|integer|in:' . self::TYPE_DIRECTORY . ',' . self::TYPE_FILE,
            'target_id' => 'nullable|integer',
        ]);

        $userId = Auth::user()->id;
        $targetId = $validated['target_id'] ?? null;

        // The destination has to be a folder this user owns; the root is null.
        if ($targetId !== null) {
            $target = Directory::where('user_id', $userId)->find($targetId);
            if ($target === null) {
                return response()->json(['status' => 0, 'error' => 'Destination folder not found.'], 404);
            }
        }

        $fileIds = [];
        $directoryIds = [];
        foreach ($validated['items'] as $item) {
            if ((int) $item['type'] === self::TYPE_DIRECTORY) {
                $directoryIds[] = (int) $item['id'];
            } else {
                $fileIds[] = (int) $item['id'];
            }
        }

        // A folder cannot be dropped inside itself or inside its own subtree:
        // that would detach the whole branch from the root for good.
        if ($targetId !== null && !empty($directoryIds)) {
            $subtree = array_merge(...($this->collectDescendantDirectories($userId, $directoryIds) ?: [[]]));
            if (in_array($targetId, $subtree, true)) {
                return response()->json([
                    'status' => 0,
                    'error' => 'A folder cannot be moved inside itself.',
                ], 422);
            }
        }

        $movedDirectories = 0;
        $movedFiles = 0;

        DB::transaction(function () use ($userId, $fileIds, $directoryIds, $targetId, &$movedDirectories, &$movedFiles) {
            if (!empty($directoryIds)) {
                $movedDirectories = Directory::where('user_id', $userId)
                    ->whereIn('id', $directoryIds)
                    ->update(['parent_id' => $targetId]);
            }
            if (!empty($fileIds)) {
                $movedFiles = File::where('user_id', $userId)
                    ->whereIn('id', $fileIds)
                    ->update(['parent_id' => $targetId]);
            }
        });

        return response()->json([
            'status' => 1,
            'moved_directories' => $movedDirectories,
            'moved_files' => $movedFiles,
        ]);
    }

    /**
     * Delete files and directories. Directories take their whole subtree with
     * them, and every stored file is removed from disk as well as from the row.
     */
    public function deleteItems(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer',
            'items.*.type' => 'required|integer|in:' . self::TYPE_DIRECTORY . ',' . self::TYPE_FILE,
        ]);

        $userId = Auth::user()->id;

        $fileIds = [];
        $directoryIds = [];
        foreach ($validated['items'] as $item) {
            if ((int) $item['type'] === self::TYPE_DIRECTORY) {
                $directoryIds[] = (int) $item['id'];
            } else {
                $fileIds[] = (int) $item['id'];
            }
        }

        // Every descendant folder goes too, otherwise its rows would be orphaned.
        $levels = $this->collectDescendantDirectories($userId, $directoryIds);
        $allDirectoryIds = array_merge(...($levels ?: [[]]));

        $files = File::where('user_id', $userId)
            ->where(function ($query) use ($fileIds, $allDirectoryIds) {
                $query->whereIn('id', $fileIds);
                if (!empty($allDirectoryIds)) {
                    $query->orWhereIn('parent_id', $allDirectoryIds);
                }
            })
            ->get();

        try {
            DB::transaction(function () use ($files, $levels, $userId) {
                if ($files->isNotEmpty()) {
                    File::whereIn('id', $files->pluck('id'))->delete();
                }

                // Deepest level first: directory.parent_id is a foreign key onto
                // the same table, so a parent cannot go before its children.
                foreach (array_reverse($levels) as $level) {
                    Directory::where('user_id', $userId)->whereIn('id', $level)->delete();
                }
            });
        } catch (Throwable $e) {
            return response()->json(['status' => 0, 'error' => 'The items could not be deleted.'], 500);
        }

        // Disk cleanup runs after the transaction commits: a failed delete here
        // leaves an orphan blob, which is far better than a row pointing nowhere.
        foreach ($files as $file) {
            Storage::disk(self::FILES_DISK)->delete('users/' . $userId . '/' . $file->path);
        }

        return response()->json([
            'status' => 1,
            'deleted_files' => $files->count(),
            'deleted_directories' => count($allDirectoryIds),
        ]);
    }

    /**
     * Breadth-first walk down the folder tree. Returns one array of ids per depth
     * level, shallowest first, so the caller can delete from the bottom up.
     * Only rows owned by the user are ever collected.
     */
    private function collectDescendantDirectories(int $userId, array $directoryIds): array
    {
        if (empty($directoryIds)) {
            return [];
        }

        $owned = Directory::where('user_id', $userId)
            ->whereIn('id', $directoryIds)
            ->pluck('id')
            ->all();

        if (empty($owned)) {
            return [];
        }

        $levels = [$owned];
        $seen = $owned;
        $pending = $owned;

        while (!empty($pending)) {
            $children = Directory::where('user_id', $userId)
                ->whereIn('parent_id', $pending)
                ->whereNotIn('id', $seen)
                ->pluck('id')
                ->all();

            if (empty($children)) {
                break;
            }

            $levels[] = $children;
            $seen = array_merge($seen, $children);
            $pending = $children;
        }

        return $levels;
    }

    /**
     * Name search across the user's files and directories.
     */
    public function search(Request $request)
    {
        $validated = $request->validate([
            'q' => 'required|string|min:2|max:255',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $userId = Auth::user()->id;
        $limit = $validated['limit'] ?? 10;
        // escapeLike keeps a literal % or _ in the query from matching everything.
        $term = '%' . $this->escapeLike($validated['q']) . '%';

        $directories = Directory::where('user_id', $userId)
            ->where('name', 'like', $term)
            ->orderBy('name')
            ->limit($limit)
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'parent_id' => $item->parent_id,
                'type' => self::TYPE_DIRECTORY,
            ]);

        $files = File::where('user_id', $userId)
            ->where('name', 'like', $term)
            ->orderBy('name')
            ->limit($limit)
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'parent_id' => $item->parent_id,
                'type' => self::TYPE_FILE,
                'size' => $item->size,
                'extension' => $item->extension,
            ]);

        return response()->json([
            'results' => $directories->concat($files)->take($limit)->values(),
        ]);
    }

    /**
     * Every file of one category, wherever it sits in the tree. This is what the
     * Pdf / Documents / Images / Videos / Audios sections list.
     */
    public function getFilesByCategory(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|in:' . implode(',', array_keys(self::CATEGORIES)),
            'page' => 'nullable|integer|min:1',
            'pageSize' => 'nullable|integer|min:1|max:100',
        ]);

        $files = File::with(['user'])
            ->where('user_id', Auth::user()->id)
            ->where(fn ($query) => $this->applyCategory($query, $validated['category']))
            ->orderByDesc('created_at')
            ->paginate($validated['pageSize'] ?? 25, ['*'], 'page', $validated['page'] ?? 1);

        return response()->json($files);
    }

    /**
     * What the Storage section reports: total bytes held and the split per category.
     */
    public function getStorageUsage()
    {
        $userId = Auth::user()->id;

        $usage = [];
        foreach (array_keys(self::CATEGORIES) as $category) {
            $query = File::where('user_id', $userId)
                ->where(fn ($inner) => $this->applyCategory($inner, $category));

            $usage[] = [
                'category' => $category,
                'files' => (clone $query)->count(),
                'size' => (float) (clone $query)->sum('size'),
            ];
        }

        $totalSize = (float) File::where('user_id', $userId)->sum('size');
        $categorisedSize = array_sum(array_column($usage, 'size'));

        return response()->json([
            'total_files' => File::where('user_id', $userId)->count(),
            'total_directories' => Directory::where('user_id', $userId)->count(),
            'total_size' => $totalSize,
            'categories' => $usage,
            // Anything the categories above do not claim.
            'other_size' => max($totalSize - $categorisedSize, 0),
        ]);
    }

    private function applyCategory($query, string $category)
    {
        $definition = self::CATEGORIES[$category];

        foreach ($definition['mimes'] as $mime) {
            $query->orWhere('mime', 'like', $this->escapeLike($mime) . '%');
        }
        foreach ($definition['extensions'] as $extension) {
            $query->orWhere('extension', $extension);
        }

        return $query;
    }

    private function escapeLike(string $value): string
    {
        return str_replace(['\\', '%', '_'], ['\\\\', '\%', '\_'], $value);
    }
}
