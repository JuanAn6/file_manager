import { useState, useRef, useEffect } from "react";
import '../../styles/Menu.css';

function Menu({ trigger, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const toggle = () => setOpen(o => !o);

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

      {open && (
        <div className='menu-custom'>
          {children}
        </div>
      )}
    </div>
  );

}
export default Menu;