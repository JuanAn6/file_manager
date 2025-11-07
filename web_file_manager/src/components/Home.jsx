import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Home() {
  
  const navigate = useNavigate();

  return (
    <div >
      <h1>Home page</h1>
    </div>
  );
}
export default Home;