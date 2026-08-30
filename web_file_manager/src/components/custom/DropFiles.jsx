import { useId, useState } from 'react';
import api from '../../api/axios';
import Icon from './Icon';

/**
 * The file picker for the open folder.
 *
 * Dropping is not handled here: GlobalDropUpload covers the whole viewport, so
 * a drop anywhere — this frame included — takes a single path and cannot upload
 * the same files twice.
 */
function DropFiles({ parentId, onUploaded }) {
  const inputId = useId();
  const [status, setStatus] = useState(null);

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append('files[]', file));
    if (parentId != null) formData.append('parent_id', parentId);

    setStatus({ tone: 'busy', text: `Uploading ${files.length} file(s)…` });

    try {
      await api.post('/upload_files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus({ tone: 'ok', text: `${files.length} file(s) uploaded.` });
      // The listing used to keep showing the folder as it was before the upload.
      if (onUploaded) onUploaded();
    } catch (error) {
      console.error('Error uploading files:', error);
      setStatus({ tone: 'error', text: 'Upload failed. Try again.' });
    }
  };

  return (
    <div className='dropzone'>
      <p className='kicker'>Upload</p>
      <p style={{ margin: 0 }}>Drop your files anywhere on the page, or select them.</p>

      <input
        id={inputId}
        type='file'
        multiple
        onChange={(evt) => {
          uploadFiles(evt.target.files);
          evt.target.value = '';
        }}
      />
      <label className='btn btn-secondary' htmlFor={inputId}>
        <Icon name='upload' size={16} /> Select files
      </label>

      {status && (
        <p
          className={status.tone === 'error' ? 'field-error' : 'kicker'}
          role='status'
          style={{ margin: 0 }}
        >
          {status.text}
        </p>
      )}
    </div>
  );
}

export default DropFiles;
