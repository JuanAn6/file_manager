import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import Modal from './Modal';
import Loading from '../custom/Loading';
import Icon from '../custom/Icon';

const DIRECTORY = 1;
const ROOT = null;

/**
 * Destination picker for a move. Drag and drop only reaches what is on screen;
 * this reaches any folder in the tree, and is the keyboard path to the same
 * operation.
 */
function MoveToDialog({ isOpen, items, currentParent, onClose, onMove }) {
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [directories, setDirectories] = useState([]);
  const [selected, setSelected] = useState(ROOT);
  const [expanded, setExpanded] = useState(() => new Set());
  const [moving, setMoving] = useState(false);
  const [moveError, setMoveError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError('');
      setSelected(ROOT);
      setMoveError('');
      try {
        const response = await api.get('/directory_tree');
        if (!cancelled) setDirectories(response.data.directories ?? []);
      } catch (error) {
        console.error('Error getting the folder tree:', error);
        if (!cancelled) setLoadError('The folder list could not be loaded.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const movedFolderIds = useMemo(
    () => new Set(items.filter((item) => item.type === DIRECTORY).map((item) => item.id)),
    [items],
  );

  // A folder cannot receive itself or anything under it: that would cut the
  // branch off the root. The server refuses it too; here it is simply not offered.
  const blocked = useMemo(() => {
    const byParent = new Map();
    directories.forEach((dir) => {
      const key = dir.parent_id ?? 'root';
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key).push(dir);
    });

    const result = new Set(movedFolderIds);
    const pending = [...movedFolderIds];
    while (pending.length > 0) {
      const id = pending.pop();
      (byParent.get(id) ?? []).forEach((child) => {
        if (result.has(child.id)) return;
        result.add(child.id);
        pending.push(child.id);
      });
    }
    return result;
  }, [directories, movedFolderIds]);

  const childrenOf = (parentId) =>
    directories.filter((dir) => (dir.parent_id ?? null) === parentId);

  const hasChildren = (id) => directories.some((dir) => (dir.parent_id ?? null) === id);

  const toggle = (id) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderLevel = (parentId, depth) =>
    childrenOf(parentId).map((dir) => {
      const isBlocked = blocked.has(dir.id);
      const isOpen = expanded.has(dir.id);

      return (
        <div key={dir.id}>
          <div className='tree-row' style={{ paddingLeft: `calc(${depth} * var(--space-md))` }}>
            {hasChildren(dir.id) ? (
              <button
                type='button'
                className='tree-toggle'
                onClick={() => toggle(dir.id)}
                aria-expanded={isOpen}
                aria-label={isOpen ? `Collapse ${dir.name}` : `Expand ${dir.name}`}
              >
                <Icon name={isOpen ? 'chevron-down' : 'chevron-right'} size={14} />
              </button>
            ) : (
              <span className='tree-toggle' aria-hidden='true' />
            )}

            <button
              type='button'
              className={'tree-item ' + (selected === dir.id ? 'is-selected' : '')}
              onClick={() => setSelected(dir.id)}
              disabled={isBlocked}
              title={isBlocked ? 'A folder cannot be moved inside itself' : undefined}
            >
              <Icon name='folder' size={16} />
              {dir.name}
              {dir.id === currentParent && <span className='tag tag-neutral'>Current</span>}
            </button>
          </div>

          {isOpen && renderLevel(dir.id, depth + 1)}
        </div>
      );
    });

  const submit = async () => {
    setMoving(true);
    setMoveError('');
    try {
      await onMove(items, selected);
      onClose();
    } catch (error) {
      setMoveError(error?.message ?? 'The items could not be moved.');
    } finally {
      setMoving(false);
    }
  };

  const label =
    items.length === 1 ? `“${items[0]?.name}”` : `${items.length} items`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Move to'>
      <div className='dialog-body'>
        <p className='kicker'>Moving {label}</p>

        {loading ? (
          <Loading label='Loading folders' />
        ) : loadError ? (
          <p className='field-error' role='alert'>{loadError}</p>
        ) : (
          <div className='tree'>
            <div className='tree-row'>
              <span className='tree-toggle' aria-hidden='true' />
              <button
                type='button'
                className={'tree-item ' + (selected === ROOT ? 'is-selected' : '')}
                onClick={() => setSelected(ROOT)}
              >
                <Icon name='home' size={16} />
                Home
                {currentParent === null && <span className='tag tag-neutral'>Current</span>}
              </button>
            </div>
            {renderLevel(null, 1)}
          </div>
        )}

        {moveError && <p className='field-error' role='alert'>{moveError}</p>}
      </div>

      <div className='dialog-actions'>
        <button type='button' className='btn btn-secondary' onClick={onClose}>
          Cancel
        </button>
        <button
          type='button'
          className='btn btn-primary'
          onClick={submit}
          disabled={moving || loading || selected === currentParent}
          title={selected === currentParent ? 'The items are already in this folder' : undefined}
        >
          <Icon name='folder-input' size={16} />
          {moving ? 'Moving…' : 'Move here'}
        </button>
      </div>
    </Modal>
  );
}

export default MoveToDialog;
