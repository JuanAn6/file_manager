import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Menu from './custom/Menu';

function Home() {
  
  const navigate = useNavigate();

  return (
    <div >
      <h1>Home page</h1>
      <Menu trigger={<button>Open</button>}>
        <span>This is a pop up menu!</span>
      </Menu>
    </div>
  );
}
export default Home;