import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Menu from './custom/Menu';
import Loading from './custom/Loading';
import FileList from './custom/FileList';
import BreadCrumbs from './custom/BreadCrumbs';
import Modal from './modals/ModalNewFolder';

function Home() {
  
  const navigate = useNavigate();
  const [loadingComplete, setLoadingComplete] = useState(false); 
  const [parent, setParent] = useState(null)
  const [modalNewFolderOpen, setModalNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState(''); 
  const [breadcrumbs, setBreadcrumbs] = useState([]);
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

  useEffect(()=>{
    getDirectory();
  },[parent])

  const getDirectory = async (id = null) =>{
    let id_send = parent;
    if(id != null) id_send = id;
    
    setLoadingComplete(false);
    try {
      const response = await api.post('/get_directory', {parent_id: id_send});
      combineDirectoriesAndFiles(response.data)
      setLoadingComplete(true);
    } catch (error) { 
      console.error('Error getting directory:', error);
    }
  }

  //Make combination of both types
  const combineDirectoriesAndFiles = (data) => {
    // console.log(data);
    let tempItems = [];

    data.directories.forEach(item => {
      item.type = 1;
      item.extension = '';
      item.size = 0;
      item.checked = false;
      tempItems.push(item);
    })

    data.files.forEach(item => {
      item.type = 2;
      item.checked = false;
      tempItems.push(item);
    })
    // console.log('tempItems', tempItems);
    setItems(tempItems);
    setBreadcrumbs(data.breadcrumbs.reverse());
  }

  const goFolder = (insideFloerId)=>{
    setParent(insideFloerId);
  }

  const createNewFolder = async (evt) =>{
    evt.target.disabled = true;
    if(newFolderName.trim() == '' || newFolderName.trim() >= 1024 ){
      console.log('show limits');
      evt.target.disabled = false;
      return;
    }

    try {
      const response = await api.post('/create_new_folder', {name: newFolderName.trim(), parent_id: parent});
      console.log(response);
      evt.target.disabled = false;
      closeModalNewFolder();
      getDirectory();
    } catch (error) { 
      evt.target.disabled = false;
      console.error('Error creating folder:', error);
    }
  }
  const closeModalNewFolder = ()=>{
    setNewFolderName(''); 
    setModalNewFolderOpen(false);
  }

  return (
    <>
    <div className='custom-container'>
      <BreadCrumbs items={breadcrumbs} goFolder={goFolder} /> 
    </div>
    <div className='custom-container'>
      {!loadingComplete ? 
        <Loading></Loading>
      :
      <>
        <button onClick={() => setModalNewFolderOpen(true) }>New Folder</button>
        <Modal isOpen={modalNewFolderOpen} onClose={() => closeModalNewFolder() } title='Create new folder'>
          <div className='modal-container-flex-column'>
            <label htmlFor='folder_name'>New folder name</label>
            <input type='text' name='folder_name' placeholder='Name...' value={newFolderName} onChange={(evt) => setNewFolderName(evt.target.value)}/>
            <div className='modal-btn-container'>
              <button className='btn-cancel' onClick={() => { closeModalNewFolder() }}>Cancel</button>
              <button className='btn-save' onClick={(evt) =>{ createNewFolder(evt) }}>Save</button>
            </div>
          </div>
        </Modal>
        <FileList items={items} setItems={setItems} goFolder={goFolder} />
      </>
      }
    </div>
    </>
  );
}
export default Home;