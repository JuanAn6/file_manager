import { useState } from 'react';
import Icon from './Icon';
import Menu from './Menu';
import { formatDateFromDatabse, formatSize } from '../../utils/utils';
import { DRAG_MIME, isInternalDrag } from '../../utils/drag';

const DIRECTORY = 1;

function FileList({
  items,
  setItems,
  goFolder,
  onMove,
  dragRef,
  onRename,
  onMoveTo,
  onDelete,
}) {
  const allChecked = items.length > 0 && items.every((item) => item.checked);
  const [dropTargetId, setDropTargetId] = useState(null);
  const [draggingIds, setDraggingIds] = useState([]);

  const changeSelection = (index, select) => {
    // index === null selects (or clears) every row.
    if (index === null) {
      setItems(items.map((item) => ({ ...item, checked: select })));
      return;
    }
    setItems(items.map((item, i) => (i === index ? { ...item, checked: select } : item)));
  };

  const openItem = (item) => {
    if (item.type === DIRECTORY) goFolder(item.id);
  };

  /* -- Drag source ------------------------------------------------------ */

  const handleDragStart = (evt, item) => {
    // Dragging a selected row moves the whole selection; dragging an unselected
    // one moves just that row, which is what every file manager does.
    const dragged = item.checked ? items.filter((entry) => entry.checked) : [item];
    const payload = dragged.map((entry) => ({ id: entry.id, type: entry.type, name: entry.name }));

    dragRef.current = payload;
    setDraggingIds(payload.map((entry) => `${entry.type}-${entry.id}`));

    evt.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload));
    evt.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    dragRef.current = null;
    setDraggingIds([]);
    setDropTargetId(null);
  };

  /* -- Drop target ------------------------------------------------------ */

  const canDropOn = (item) => {
    if (item.type !== DIRECTORY) return false;
    const dragged = dragRef.current;
    if (!dragged) return false;
    // A folder cannot be dropped on itself.
    return !dragged.some((entry) => entry.type === DIRECTORY && entry.id === item.id);
  };

  const handleDragOver = (evt, item) => {
    if (!isInternalDrag(evt) || !canDropOn(item)) return;
    // preventDefault is what marks the element as a valid drop target.
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'move';
    setDropTargetId(item.id);
  };

  const handleDragLeave = (item) => {
    setDropTargetId((current) => (current === item.id ? null : current));
  };

  const handleDrop = (evt, item) => {
    if (!isInternalDrag(evt) || !canDropOn(item)) return;
    evt.preventDefault();
    evt.stopPropagation();

    const payload = dragRef.current;
    setDropTargetId(null);
    setDraggingIds([]);
    dragRef.current = null;

    if (payload && onMove) onMove(payload, item.id);
  };

  return (
    <table className='table'>
      <thead>
        <tr>
          <th className='col-fit'>
            <input
              type='checkbox'
              checked={allChecked}
              onChange={(evt) => changeSelection(null, evt.target.checked)}
              aria-label='Select all'
            />
          </th>
          <th className='col-fit'>Type</th>
          <th>Name</th>
          <th>Owner</th>
          <th>Modified at</th>
          <th>Created at</th>
          <th>Size / Items</th>
          <th className='col-fit'>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 && (
          <tr>
            <td colSpan={8} className='muted'>This folder is empty.</td>
          </tr>
        )}

        {items.map((item, index) => {
          const rowKey = `${item.type}-${item.id}`;
          const classes = [
            dropTargetId === item.id ? 'is-drop-target' : '',
            draggingIds.includes(rowKey) ? 'is-dragging' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <tr
              // Directories and files have independent id sequences, so the id
              // alone collides as soon as both lists are merged into one table.
              key={rowKey}
              className={classes}
              draggable
              aria-selected={Boolean(item.checked)}
              onDragStart={(evt) => handleDragStart(evt, item)}
              onDragEnd={handleDragEnd}
              onDragOver={(evt) => handleDragOver(evt, item)}
              onDragLeave={() => handleDragLeave(item)}
              onDrop={(evt) => handleDrop(evt, item)}
              onDoubleClick={() => openItem(item)}
              onClick={() => changeSelection(index, !item.checked)}
            >
              <td className='col-fit'>
                <input
                  type='checkbox'
                  checked={Boolean(item.checked)}
                  onChange={(evt) => changeSelection(index, evt.target.checked)}
                  onClick={(evt) => evt.stopPropagation()}
                  aria-label={`Select ${item.name}`}
                />
              </td>
              <td className='col-fit'>
                <Icon name={item.type === DIRECTORY ? 'folder' : 'file'} size={18} />
              </td>
              <td>{item.name}</td>
              {/* The API omits the relation on some rows, so never dereference it blind. */}
              <td className='muted'>{item.user?.name ?? '—'}</td>
              <td className='num'>{formatDateFromDatabse(item.updated_at)}</td>
              <td className='num'>{formatDateFromDatabse(item.created_at)}</td>
              <td className='num'>{item.type === DIRECTORY ? '—' : formatSize(item.size)}</td>
              {/* The row click toggles selection, so the menu keeps its own
                  clicks to itself. */}
              <td className='col-fit' onClick={(evt) => evt.stopPropagation()}>
                <Menu
                  align='end'
                  trigger={
                    <span
                      className='btn btn-ghost btn-icon'
                      title={`Actions for ${item.name}`}
                      role='button'
                    >
                      <Icon name='more-vertical' />
                    </span>
                  }
                >
                  <button type='button' className='menu-item' onClick={() => onRename([item])}>
                    <Icon name='pencil' size={16} /> Rename
                  </button>
                  <button type='button' className='menu-item' onClick={() => onMoveTo([item])}>
                    <Icon name='folder-input' size={16} /> Move to
                  </button>
                  <button type='button' className='menu-item' onClick={() => onDelete([item])}>
                    <Icon name='trash' size={16} /> Delete
                  </button>
                </Menu>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default FileList;
