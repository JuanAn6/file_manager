import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Menu from './custom/Menu';
import Loading from './custom/Loading';
import '../styles/SearchBar.css';

function SearchBar() {
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(false);
  const [searchQuery, setQuery] = useState('');

  const handleSearch = (e) =>{
    let value = e.target.value; 
    setQuery(value);
    console.log(value);
    if(value.trim().length >= 3){
      setOpenMenu(true)
    }else{
      setOpenMenu(false)
    }
  }
  
  
  return (
    <div className='search-input-box'>
      <Menu isOpen={openMenu} onOpenChange={setOpenMenu} customTrigger={
        <input type="text" placeholder='Search something...' onChange={handleSearch} value={searchQuery} />
      }>
        <span>Results:</span>
        <div><Loading/></div>
      </Menu>
    </div>
  );
}
export default SearchBar;