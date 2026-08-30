import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Menu from './Menu';
import Loading from './Loading';
import Icon from './Icon';
import { formatSize } from '../../utils/utils';

const MIN_QUERY = 2;
const DEBOUNCE_MS = 300;
const DIRECTORY = 1;

function SearchBar() {
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(false);
  const [searchQuery, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  // Keeps an earlier, slower response from overwriting a newer one.
  const requestId = useRef(0);

  useEffect(() => {
    const term = searchQuery.trim();

    if (term.length < MIN_QUERY) {
      setResults([]);
      setSearching(false);
      setError('');
      setOpenMenu(false);
      return;
    }

    setOpenMenu(true);
    setSearching(true);
    setError('');

    const current = ++requestId.current;
    const timer = setTimeout(async () => {
      try {
        const response = await api.get('/search', { params: { q: term } });
        if (current !== requestId.current) return;
        setResults(response.data.results ?? []);
      } catch (err) {
        console.error('Error searching:', err);
        if (current !== requestId.current) return;
        setError('The search failed.');
      } finally {
        if (current === requestId.current) setSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const openResult = (item) => {
    setOpenMenu(false);
    setQuery('');
    // A folder opens itself; a file opens the folder holding it. The folder lives
    // in the URL, so a result is a plain navigation and the location is linkable.
    const target = item.type === DIRECTORY ? item.id : item.parent_id;
    navigate(target == null ? '/' : `/?folder=${target}`);
  };

  return (
    <Menu
      isOpen={openMenu}
      onOpenChange={setOpenMenu}
      width='360px'
      block
      customTrigger={
        <div className='field'>
          <label htmlFor='search' style={{ position: 'absolute', left: '-9999px' }}>
            Search
          </label>
          <input
            id='search'
            className='input'
            type='search'
            placeholder='Search something...'
            onChange={(evt) => setQuery(evt.target.value)}
            value={searchQuery}
            autoComplete='off'
          />
        </div>
      }
    >
      <p className='kicker' style={{ padding: 'var(--space-xs) var(--space-sm)' }}>Results</p>

      {searching && <Loading label='Searching' />}

      {!searching && error && (
        <p className='field-error' role='alert' style={{ padding: '0 var(--space-sm) var(--space-sm)' }}>
          {error}
        </p>
      )}

      {!searching && !error && results.length === 0 && (
        <p className='muted' style={{ padding: '0 var(--space-sm) var(--space-sm)', margin: 0 }}>
          Nothing found.
        </p>
      )}

      {!searching &&
        !error &&
        results.map((item) => (
          <button
            key={`${item.type}-${item.id}`}
            type='button'
            className='menu-item'
            onClick={() => openResult(item)}
          >
            <Icon name={item.type === DIRECTORY ? 'folder' : 'file'} size={16} />
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.name}
            </span>
            {item.type !== DIRECTORY && <span className='muted'>{formatSize(item.size)}</span>}
          </button>
        ))}
    </Menu>
  );
}

export default SearchBar;
