import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import Icon from './Icon';
import { isFileDrag } from '../../utils/drag';

/**
 * Dropping files anywhere on the app uploads them. An overlay covers the whole
 * viewport while an operating-system drag is in flight, so the drop never has to
 * land on a particular widget.
 *
 * Internal drags (moving an item between folders) do not carry 'Files', so they
 * never raise this overlay and keep reaching the listing underneath.
 */
export const UPLOAD_EVENT = 'file-manager:files-uploaded';

function GlobalDropUpload() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState(null);
  // dragenter/dragleave fire for every element crossed, so count them instead of
  // toggling: the overlay only closes when the pointer truly leaves the window.
  const depth = useRef(0);

  // Files land in the folder currently open in the listing; from any other
  // section there is no open folder, so they go to the root.
  const targetFolder = useCallback(() => {
    if (location.pathname !== '/') return null;
    const folder = searchParams.get('folder');
    return folder === null || folder === '' ? null : Number(folder);
  }, [location.pathname, searchParams]);

  const uploadFiles = useCallback(
    async (fileList) => {
      const files = Array.from(fileList ?? []);
      if (files.length === 0) return;

      const parentId = targetFolder();
      const formData = new FormData();
      files.forEach((file) => formData.append('files[]', file));
      if (parentId != null) formData.append('parent_id', parentId);

      setStatus({ tone: 'busy', text: `Uploading ${files.length} file(s)…` });

      try {
        await api.post('/upload_files', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setStatus({ tone: 'ok', text: `${files.length} file(s) uploaded.` });

        // Take the user to where the files actually landed, and tell the
        // listing to reload when it is already showing that folder.
        if (location.pathname !== '/') navigate(parentId == null ? '/' : `/?folder=${parentId}`);
        window.dispatchEvent(new CustomEvent(UPLOAD_EVENT, { detail: { parentId } }));
      } catch (error) {
        console.error('Error uploading files:', error);
        setStatus({ tone: 'error', text: 'Upload failed. Try again.' });
      }
    },
    [location.pathname, navigate, targetFolder],
  );

  useEffect(() => {
    const handleDragEnter = (evt) => {
      if (!isFileDrag(evt)) return;
      evt.preventDefault();
      depth.current += 1;
      setDragging(true);
    };

    const handleDragOver = (evt) => {
      if (!isFileDrag(evt)) return;
      // Without this the browser navigates away and opens the dropped file.
      evt.preventDefault();
      evt.dataTransfer.dropEffect = 'copy';
    };

    const handleDragLeave = (evt) => {
      if (!isFileDrag(evt)) return;
      depth.current -= 1;
      if (depth.current <= 0) {
        depth.current = 0;
        setDragging(false);
      }
    };

    const handleDrop = (evt) => {
      if (!isFileDrag(evt)) return;
      evt.preventDefault();
      depth.current = 0;
      setDragging(false);
      uploadFiles(evt.dataTransfer.files);
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [uploadFiles]);

  // The status toast fades on its own; an upload the user already saw should
  // not sit on the screen for the rest of the session.
  useEffect(() => {
    if (!status || status.tone === 'busy') return;
    const timer = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <>
      {dragging && (
        <div className='upload-overlay' aria-hidden='true'>
          <div className='upload-overlay-panel'>
            <Icon name='upload' size={32} />
            <p className='kicker' style={{ margin: 0 }}>Drop to upload</p>
            <p style={{ margin: 0 }}>
              The files go into the folder you have open.
            </p>
          </div>
        </div>
      )}

      {status && (
        <div className={'toast ' + (status.tone === 'error' ? 'toast-error' : '')} role='status'>
          {status.tone === 'busy' && <span className='spinner' />}
          {status.tone === 'ok' && <Icon name='check' size={16} />}
          {status.tone === 'error' && <Icon name='alert-triangle' size={16} />}
          {status.text}
        </div>
      )}
    </>
  );
}

export default GlobalDropUpload;
