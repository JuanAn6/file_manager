import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Menu from './custom/Menu';
import Loading from './custom/Loading';
import Modal from './modals/ModalNewFolder';
import '../styles/List.css';

function Home() {
  
  const navigate = useNavigate();
  const [loadingComplete, setLoadingComplete] = useState(false); 
  const [users, setUsers] = useState([]);
  const [paginationData, setPaginationData] = useState([]);
  
  let loadUsers = 0;
  useEffect(()=>{
    if(loadUsers == 0){
      getUsers();
      loadUsers = 1;
    }
  },[])

  const getUsers = async (id = null) =>{
    setLoadingComplete(false);
    try {
      const response = await api.get('/get_users_list', {params: {page: 1, pageSize: 10}});
      console.log(response);
      setUsers(response.data.data);
      setPaginationData(response.data);
      setLoadingComplete(true);
    } catch (error) { 
      console.error('Error in logout:', error);
    }
  }

  return (
    <>
    <div className='custom-container'>
      <h2>Users</h2>
    {!loadingComplete ? 
        <Loading></Loading>
    :
    <div className='list'>
      {users.map(user => 
        <div className='row' key={user.id}>
            {user.name}, {user.email}
        </div>
      )}
      <div className='pagination'>
        <div>
          showing from to of total
        </div>
        <div>
          first previous, numbers, next last
        </div>
      </div>
    </div>
    }
    </div>
    </>
  );
}
export default Home;