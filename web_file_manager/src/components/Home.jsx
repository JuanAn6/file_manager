import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Menu from './custom/Menu';
import Loading from './custom/Loading';
import FileList from './custom/FileList';

function Home() {
  
  const navigate = useNavigate();

  const [items, setItems] = useState([
    {
      id: 1,  
      name: 'Test',
      user_id: 1,
      user:{ name: 'Juan' },
      type: 2, //1 Directory, 2 File
      size: 124, //kb
      extension: '.pdf',
      created_at: '2024-12-01', 
      updated_at: '2025-03-10',
    }
  ]);
  
  return (
    <div >
      <h3>Breadcrumbs</h3>
      <Menu trigger={<button>Open</button>}>
        <span>This is a pop up menu!</span>
      </Menu>

      <FileList items={items} />
    </div>
  );
}
export default Home;