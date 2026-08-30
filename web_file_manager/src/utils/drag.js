/**
 * Drag and drop plumbing shared by the listing and the breadcrumbs.
 *
 * Two kinds of drag reach the app and they must never be confused:
 *  - an internal move, which carries DRAG_MIME
 *  - files coming from the operating system, which carry 'Files'
 *
 * During `dragover` the browser refuses to hand over the payload — only the
 * list of types is readable — so the type is what every decision is based on.
 */
export const DRAG_MIME = 'application/x-file-manager-items';

export const isInternalDrag = (event) =>
  Array.from(event.dataTransfer?.types ?? []).includes(DRAG_MIME);

export const isFileDrag = (event) =>
  Array.from(event.dataTransfer?.types ?? []).includes('Files');
