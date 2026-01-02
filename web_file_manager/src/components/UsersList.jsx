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
  const [users, setUsers] = useState([]);

  useEffect(()=>{
    getUsers();
  },[])

  const getUsers = async (id = null) =>{
    setLoadingComplete(false);
    try {
      const response = await api.post('/get_users_list', {page: 1, pageSize: 10});
      setUsers(response.data);
      setLoadingComplete(true);
    } catch (error) { 
      console.error('Error in logout:', error);
    }
  }

  return (
    <>
    <div className='custom-container'>
    {!loadingComplete ? 
        <Loading></Loading>
    :
    <>
        {users.map(user => 
            <div>
                {user.name}
            </div>
        )}
    </>
    }
    </div>
    </>
  );
}
export default Home;