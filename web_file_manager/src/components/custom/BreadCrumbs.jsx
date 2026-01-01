import { useEffect } from 'react';
import '../../styles/Breadcrumbs.css';
import home from '../../icons/home.svg'

function BreadCrumbs({items, goFolder }) {

  useEffect(()=>{
    // console.log('breadcrumbs', items);
  },[items])

  //Go home

  return (
    <div className='breadcrumbs-container'>
      <div className='breadcrumb' onClick={() => goFolder(null) }><img className='breadcrumb-icon' src={home} /> Home</div>
      {items.map(item => 
        <>
          <svg  xmlns="http://www.w3.org/2000/svg"  width="20"  height="20"  viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l14 0" /><path d="M15 16l4 -4" /><path d="M15 8l4 4" /></svg>
          <div className='breadcrumb' onClick={()=> goFolder(item.id) }> {item.name}</div>
        </>
      )}    
    </div>
  );
}
export default BreadCrumbs;