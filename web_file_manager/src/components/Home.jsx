import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Menu from './custom/Menu';
import Loading from './custom/Loading';
import FileList from './custom/FileList';

function Home() {
  
  const navigate = useNavigate();
  const [loadingComplete, setLoadingComplete] = useState(false); 

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

  const [parent, setParent] = useState(null)

  const getDirectory = async () =>{
    setLoadingComplete(false);
    try {
      const response = await api.post('/get_directory', {parent_id: parent});
      combineDirectoriesAndFiles(response.data)
      setLoadingComplete(true);
    } catch (error) {
      console.error("Error in logout:", error);
    }
  }

  //Make combination of both types
  const combineDirectoriesAndFiles = (data) => {
    console.log(data);
    let tempItems = [];

    data.directories.forEach(item => {
      item.type = 1;
      item.extension = '';
      item.size = 0;
      tempItems.push(item);
    })

    data.files.forEach(item => {
      item.type = 2;
      tempItems.push(item);
    })
    console.log('tempItems', tempItems);
    setItems(tempItems);

  }

  useEffect(()=>{
    getDirectory();
  },[])

  
  return (
    <>
    <div className="custom-container">
      <h3>Breadcrumbs</h3> 
    </div>
    <div className="custom-container">
      {!loadingComplete ? 
        <Loading></Loading>
      :
        <FileList items={items} />
      }
    </div>
    </>
  );
}
export default Home;