import { useState, useRef, useEffect } from "react";
import '../../styles/Menu.css';

function Menu({ trigger, children, isOpen, onOpenChange, customTrigger }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;

  const ref = useRef(null);

  const toggle = () => {
    const newValue = !open;
    if (onOpenChange) onOpenChange(newValue);
    else setInternalOpen(newValue);
  };

  const setOpen = (value) => {
    if (onOpenChange) onOpenChange(value);
    else setInternalOpen(value);
  };

  // Close if click outside
  useEffect(() => {
    const handleClick = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div style={{ display: "inline-block", position: "relative" }} ref={ref}>
      <div onClick={toggle} style={{ cursor: "pointer" }}>
        {trigger}
      </div>
      { customTrigger }
      {open && (
        <div className='menu-custom'>
          {children}
        </div>
      )}
    </div>
  );

}
export default Menu;