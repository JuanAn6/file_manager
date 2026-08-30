import { useEffect, useState } from 'react';
import api from '../api/axios';
import Loading from './custom/Loading';
import Icon from './custom/Icon';
import { formatDateFromDatabse, formatSize } from '../utils/utils';
import { downloadFile, readDownloadError } from '../utils/download';

const PAGE_SIZE = 25;

/**
 * Every file of one category, wherever it sits in the tree. Backs the Pdf,
 * Documents, Images, Videos and Audios sections.
 */
function FilesByCategory({ category, title, icon }) {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [downloadError, setDownloadError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  const download = async (file) => {
    setDownloadError('');
    setDownloadingId(file.id);
    try {
      await downloadFile(file);
    } catch (err) {
      console.error('Error downloading file:', err);
      setDownloadError(await readDownloadError(err));
    } finally {
      setDownloadingId(null);
    }
  };

  // A different section reuses this component, so start over when it changes.
  useEffect(() => {
    setPage(1);
  }, [category]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingComplete(false);
      setError('');
      try {
        const response = await api.get('/get_files_by_category', {
          params: { category, page, pageSize: PAGE_SIZE },
        });
        if (cancelled) return;
        setFiles(response.data.data ?? []);
        setPagination(response.data);
      } catch (err) {
        console.error('Error getting files by category:', err);
        if (!cancelled) setError('This section could not be loaded.');
      } finally {
        if (!cancelled) setLoadingComplete(true);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [category, page]);

  const lastPage = Number(pagination.last_page) || 1;

  return (
    <div className='card'>
      <p className='kicker'>Section</p>
      <h2 className='cluster'>
        <Icon name={icon} size={24} /> {title}
      </h2>
      <hr className='hr' />

      {!loadingComplete ? (
        <Loading />
      ) : error ? (
        <p className='field-error' role='alert'>{error}</p>
      ) : (
        <>
          {downloadError && <p className='field-error' role='alert'>{downloadError}</p>}
          <table className='table'>
            <thead>
              <tr>
                <th className='col-fit'>Type</th>
                <th>Name</th>
                <th>Owner</th>
                <th>Created at</th>
                <th>Size</th>
                <th className='col-fit'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.length === 0 && (
                <tr>
                  <td colSpan={6} className='muted'>No files in this section yet.</td>
                </tr>
              )}

              {files.map((file) => (
                <tr key={file.id}>
                  <td className='col-fit'>
                    <Icon name={icon} size={18} />
                  </td>
                  <td>{file.name}</td>
                  <td className='muted'>{file.user?.name ?? '—'}</td>
                  <td className='num'>{formatDateFromDatabse(file.created_at)}</td>
                  <td className='num'>{formatSize(file.size)}</td>
                  <td className='col-fit'>
                    <button
                      type='button'
                      className='btn btn-ghost btn-icon'
                      onClick={() => download(file)}
                      disabled={downloadingId === file.id}
                      aria-label={`Download ${file.name}`}
                      title={`Download ${file.name}`}
                    >
                      <Icon name='download' />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className='pagination'>
            <p className='kicker' style={{ margin: 0 }}>
              {pagination.from ?? 0} to {pagination.to ?? 0} of {pagination.total ?? 0}
            </p>

            <div className='cluster' style={{ gap: 'var(--space-2xs)' }}>
              <button
                type='button'
                className='btn btn-secondary btn-sm'
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                disabled={page <= 1}
              >
                <Icon name='chevron-left' size={16} /> Prev
              </button>
              <button
                type='button'
                className='btn btn-secondary btn-sm'
                onClick={() => setPage((current) => Math.min(current + 1, lastPage))}
                disabled={page >= lastPage}
              >
                Next <Icon name='chevron-right' size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FilesByCategory;
