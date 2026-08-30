import { useEffect, useState } from 'react';
import api from '../api/axios';
import Loading from './custom/Loading';
import Icon from './custom/Icon';
import { formatSize } from '../utils/utils';

const CATEGORY_LABELS = {
  images: { label: 'Images', icon: 'image' },
  videos: { label: 'Videos', icon: 'video' },
  audios: { label: 'Audios', icon: 'music' },
  pdfs: { label: 'Pdf', icon: 'file-text' },
  documents: { label: 'Documents', icon: 'file' },
};

function Storage() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [error, setError] = useState('');
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingComplete(false);
      setError('');
      try {
        const response = await api.get('/storage_usage');
        if (!cancelled) setUsage(response.data);
      } catch (err) {
        console.error('Error getting storage usage:', err);
        if (!cancelled) setError('The storage usage could not be loaded.');
      } finally {
        if (!cancelled) setLoadingComplete(true);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const total = Number(usage?.total_size) || 0;
  // A zero total would make every share NaN, so fall back to 1 for the maths.
  const share = (size) => (total === 0 ? 0 : (Number(size) / total) * 100);

  return (
    <div className='card'>
      <p className='kicker'>Section</p>
      <h2 className='cluster'>
        <Icon name='hard-drive' size={24} /> Storage
      </h2>
      <hr className='hr' />

      {!loadingComplete ? (
        <Loading />
      ) : error ? (
        <p className='field-error' role='alert'>{error}</p>
      ) : (
        <>
          <div className='grid' style={{ '--cols': 3 }}>
            <div>
              <p className='kicker'>Total used</p>
              <p style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-heading)', margin: 0 }}>
                {formatSize(usage.total_size)}
              </p>
            </div>
            <div>
              <p className='kicker'>Files</p>
              <p style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-heading)', margin: 0 }}>
                {usage.total_files}
              </p>
            </div>
            <div>
              <p className='kicker'>Folders</p>
              <p style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-heading)', margin: 0 }}>
                {usage.total_directories}
              </p>
            </div>
          </div>

          <hr className='hr' />

          <table className='table'>
            <thead>
              <tr>
                <th className='col-fit'>Type</th>
                <th>Category</th>
                <th>Files</th>
                <th>Size</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {usage.categories.map((entry) => {
                const meta = CATEGORY_LABELS[entry.category] ?? { label: entry.category, icon: 'file' };
                return (
                  <tr key={entry.category}>
                    <td className='col-fit'><Icon name={meta.icon} size={18} /></td>
                    <td>{meta.label}</td>
                    <td className='num'>{entry.files}</td>
                    <td className='num'>{formatSize(entry.size)}</td>
                    <td>
                      <span className='meter' aria-hidden='true'>
                        <span className='meter-fill' style={{ width: `${share(entry.size)}%` }} />
                      </span>
                      <span className='num muted'>{share(entry.size).toFixed(0)}%</span>
                    </td>
                  </tr>
                );
              })}

              <tr>
                <td className='col-fit'><Icon name='file' size={18} /></td>
                <td>Other</td>
                <td className='num'>—</td>
                <td className='num'>{formatSize(usage.other_size)}</td>
                <td>
                  <span className='meter' aria-hidden='true'>
                    <span className='meter-fill' style={{ width: `${share(usage.other_size)}%` }} />
                  </span>
                  <span className='num muted'>{share(usage.other_size).toFixed(0)}%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default Storage;
