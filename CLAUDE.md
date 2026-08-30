# CLAUDE.md

Working guide for this repository. It is written so the code does not have to be re-read
before every change: structure, commands, the conventions already in force, and the traps
that have already been hit once.

**Everything in this repo is written in English** — code, identifiers, comments, commit
messages and documentation. Keep it that way.

## What this is

A file manager for a home server (Raspberry Pi or an old desktop): upload, organise and
browse files from a web page.

- `web_file_manager/` — React 19 + Vite 7 SPA, React Router 7, Axios. No TypeScript.
- `api_file_manager/` — Laravel 12 API (PHP 8.2) with JWT (`tymon/jwt-auth`) and MySQL.
- Blobs live on the disk named by `HomeController::FILES_DISK` (`public`), under
  `users/{user_id}/`; `files.path` stores only the basename. Metadata lives in the
  `directory` and `files` tables.

## Commands

Front end (always from the repo root, with `--prefix`):

```bash
npm run dev --prefix web_file_manager
```
```bash
npm run lint --prefix web_file_manager
```
```bash
npm run build --prefix web_file_manager
```

`lint` and `build` must pass with **no errors and no warnings** — that is the current state.
Start the dev server through the editor preview (`.claude/launch.json`, entry `web`, port
5173), never as a background `Bash` process.

API:

```bash
php artisan serve
```
```bash
php artisan migrate
```

`JWT_SECRET` comes from `php artisan jwt:secret`. The front end reads the API URL from
`VITE_API_URL` (`http://127.0.0.1:8000/api/v1`), which is why the API task pins port 8000.

In VS Code, `.vscode/tasks.json` carries the same commands: `api`, `web`, and `start`, which
runs both in parallel in their own terminals and is the default build task (Ctrl+Shift+B).

## Front end

- `src/main.jsx` imports exactly **one** stylesheet: `design-system/styles.css`.
- `src/api/axios.js` — the single instance; a request interceptor attaches
  `Authorization: Bearer` from `localStorage.authToken`. Every call goes through it.
- The auth context is deliberately split across three files so Fast Refresh keeps working:
  `context/AuthContext.jsx` (provider), `context/authContextValue.js` (the context),
  `context/useAuth.js` (the hook). Do not merge them back.
- `components/Home.jsx` is the hub: it owns the open folder (**in the URL**, `?folder=`), the
  selection, and `actionItems`, which decides what an open dialog acts on — the toolbar
  passes the selection, a row's `⋮` menu passes that row.
- `components/custom/Icon.jsx` — Lucide icons vendored as path data. Add icons here; do not
  add an icon dependency.
- `utils/drag.js` — drag types and helpers shared by the list and the breadcrumbs.

### Design system

`src/design-system/` (`styles.css`, `theme.json`, `readme.md`). Read its `readme.md` before
touching styles. The essentials:

- Tokens for everything: `var(--color-*)`, `--font-*`, `--space-*`, `--radius-*`,
  `--shadow-*`. Never hard-code a hex, a font or a px value the tokens already carry.
- **There are no per-component CSS files, and none should be created again.** The 13 that
  existed were deleted over duplication and class collisions (`Inputs.css` was identical to
  `SearchBar.css`; `.list` meant two different things).
- Zero radius, 1px rules, everything flush left — including labels inside wide buttons.
  Content photography goes inside `.grayscale`.
- Current theme: light blue on cream. The accent role points at ramp step **400**; text on
  the accent is the ink, except on steps 700+, where it goes back to the surface colour.
- Focus rings and the drag-target highlight use `--focus-width` (2px), **not**
  `--border-width`.
- To retheme, edit the tokens at the top of `styles.css` and update `theme.json` and the
  `readme.md` in the same pass so they do not drift.
- The app shell is a CSS grid (`.shell`), not absolute positioning.

### Accessibility (keep it)

Labels tied by `id`/`htmlFor`; `aria-label` + `title` on icon-only buttons; `role='alert'`
on errors and `role='status'` + `aria-live` on loading states; modals as
`role='dialog' aria-modal='true'`, closing on Escape and on backdrop click; `NavLink` for the
active state; `@media (prefers-reduced-motion: reduce)`.

### Drag and drop

Two different drags that share the mechanics and must never be conflated:

| Drag | Carried as | What it does |
| --- | --- | --- |
| Internal | `application/x-file-manager-items` | Moves items between folders |
| External | `Files` (from the OS) | Uploads into the open folder |

During `dragover` the browser exposes only the **types**, not the payload: the accept/reject
decision is made from the type, and the real payload lives in a `useRef` on `Home`.
`GlobalDropUpload` covers the viewport and keeps a depth counter (`dragenter`/`dragleave`
fire for every element crossed). `DropFiles` is only a file picker now: if it got its own
handlers back, a drop on it would be processed twice.

## API

Conventions already in force in `HomeController` / `UsersController` — keep them:

- **Ownership is enforced in the query**, not after it: every item lookup carries
  `where('user_id', ...)`, so someone else's id returns 404 instead of touching their row.
- Every endpoint **validates** its request; never read `$request->all()` blindly. The
  `ForceJsonResponse` middleware (on the `api` group) stops a 422 turning into a 302.
- Folder deletion: breadth-first walk, deleting leaf-to-root inside a transaction
  (`directory.parent_id` is a self-referencing FK). Blobs are removed **after** the commit.
- `escapeLike` on every search term.
- Moving folders: moving a folder into its own subtree returns 422; the guard exists on the
  client **and** on the server.
- Categories (pdf/documents/images/videos/audios) resolve by `mime` with the extension as a
  fallback, from a single shared constant.
- Disk paths via `Storage::path()`, never by composing `storage_path(...)` by hand.
- Superadmin routes sit under `middleware(['auth:api', 'role:superadmin'])`.
- `GET /download_file/{id}` streams a blob back as an attachment. The JWT travels in a
  header, which a link or `window.open` cannot set, so the front end fetches the body
  (`utils/download.js`, `responseType: 'blob'`) and saves it with an anchor instead of
  navigating. An error body therefore arrives as a blob too — `readDownloadError` reads the
  JSON back out of it.

Endpoints live in [routes/api.php](api_file_manager/routes/api.php), all under `/api/v1`.

## Known traps

- **Do not edit sources with `sed -i` / `perl -i`**: they replace the inode, Vite's watcher on
  Windows misses it, and the browser keeps serving the old version even though the file on
  disk is correct. Use a normal edit.
- React keys in the merged list: folders and files have independent id sequences, so the key
  is `${type}-${id}`.
- `<input type='number'>` yields a **string**: convert before doing pagination arithmetic.
- `Profile` sends the string `'null'` to clear the image (the backend also accepts empty).
- Always revoke blob URLs (`URL.createObjectURL`) in the effect cleanup.

## Verify before calling something done

Clean `lint` and `build`, plus a real pass in the browser preview: login, the list with a
selection and both dialogs, search, one category section, Storage, and Users. Test data
created against the local API is deleted afterwards.

## Not done yet

- Uploads are still a single `multipart` request; large files are not chunked.
- There is no preview endpoint: a file can be downloaded, but not viewed in place.
- Folders cannot be downloaded — that needs the API to zip a subtree first. A multi-file
  download saves one file at a time, so browsers may ask before saving a burst of them.
- A permanent folder tree in the sidebar, doubling as a drag target, is missing.
- `directory.items` and `directory.size` are stored as 0 and nothing recalculates them.
