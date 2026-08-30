import { useState, useRef, useEffect, useCallback } from 'react';

function Menu({ trigger, children, isOpen, onOpenChange, customTrigger, align = 'start', width, block = false, closeOnSelect = true }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;

  const ref = useRef(null);

  const setOpen = useCallback(
    (value) => {
      if (onOpenChange) onOpenChange(value);
      else setInternalOpen(value);
    },
    [onOpenChange],
  );

  const toggle = () => setOpen(!open);

  // Close on a click outside, or on Escape.
  useEffect(() => {
    if (!open) return;

    const handleClick = (evt) => {
      if (ref.current && !ref.current.contains(evt.target)) setOpen(false);
    };
    const handleKey = (evt) => {
      if (evt.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, setOpen]);

  const position = align === 'end' ? { left: 'auto', right: 0 } : { left: 0, right: 'auto' };

  return (
    <div style={{ display: block ? 'block' : 'inline-block', position: 'relative' }} ref={ref}>
      {trigger && (
        <div onClick={toggle} style={{ cursor: 'pointer' }}>
          {trigger}
        </div>
      )}
      {customTrigger}
      {open && (
        <div
          className='menu'
          style={{ ...position, ...(width ? { minWidth: width } : null) }}
          role='menu'
          // Choosing an item closes the menu; otherwise it stays open behind
          // whatever the item opened.
          onClick={() => closeOnSelect && setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default Menu;
