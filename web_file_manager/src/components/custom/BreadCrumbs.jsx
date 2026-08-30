import { useState } from 'react';
import Icon from './Icon';
import { isInternalDrag } from '../../utils/drag';

const DIRECTORY = 1;

function BreadCrumbs({ items = [], goFolder, onMove, dragRef }) {
  const [dropTargetId, setDropTargetId] = useState(undefined);

  // Dropping on a crumb moves the selection up the tree. The crumb for the
  // folder you are already in, and any folder being dragged, are not targets.
  const canDropOn = (folderId) => {
    const dragged = dragRef?.current;
    if (!dragged) return false;
    return !dragged.some((entry) => entry.type === DIRECTORY && entry.id === folderId);
  };

  const handleDragOver = (evt, folderId) => {
    if (!isInternalDrag(evt) || !canDropOn(folderId)) return;
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'move';
    setDropTargetId(folderId);
  };

  const handleDrop = (evt, folderId) => {
    if (!isInternalDrag(evt) || !canDropOn(folderId)) return;
    evt.preventDefault();
    evt.stopPropagation();

    const payload = dragRef.current;
    setDropTargetId(undefined);
    dragRef.current = null;

    if (payload && onMove) onMove(payload, folderId);
  };

  const crumbProps = (folderId) => ({
    onDragOver: (evt) => handleDragOver(evt, folderId),
    onDragLeave: () => setDropTargetId((current) => (current === folderId ? undefined : current)),
    onDrop: (evt) => handleDrop(evt, folderId),
    className: 'crumb ' + (dropTargetId === folderId ? 'is-drop-target' : ''),
  });

  return (
    <nav className='crumbs' aria-label='Breadcrumb'>
      <button type='button' onClick={() => goFolder(null)} {...crumbProps(null)}>
        <Icon name='home' size={16} /> Home
      </button>

      {items.map((item) => (
        <span key={item.id} className='crumbs'>
          <Icon name='chevron-right' size={14} className='crumb-sep' />
          <button type='button' onClick={() => goFolder(item.id)} {...crumbProps(item.id)}>
            {item.name}
          </button>
        </span>
      ))}
    </nav>
  );
}

export default BreadCrumbs;
