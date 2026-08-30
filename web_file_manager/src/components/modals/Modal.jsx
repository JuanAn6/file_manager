import { useEffect } from 'react';
import Icon from '../custom/Icon';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Escape closes the dialog; the listener only exists while it is open.
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (evt) => {
      if (evt.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className='dialog-backdrop' onMouseDown={(evt) => evt.target === evt.currentTarget && onClose()}>
      <div className='dialog' role='dialog' aria-modal='true' aria-label={title}>
        <div className='dialog-title'>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button type='button' className='btn btn-ghost btn-icon' onClick={onClose} aria-label='Close'>
            <Icon name='x' />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
