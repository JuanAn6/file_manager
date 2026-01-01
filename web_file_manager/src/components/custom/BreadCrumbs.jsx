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
      {/* {items.map(item => 
        <div>
        </div>
      )}     */}
    </div>
  );
}
export default BreadCrumbs;