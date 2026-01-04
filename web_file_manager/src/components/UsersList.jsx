import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Menu from './custom/Menu';
import Loading from './custom/Loading';
import Modal from './modals/ModalNewFolder';
import '../styles/List.css';
import List from './custom/List';

function UsersList() {
  
  const navigate = useNavigate();
  const [loadingComplete, setLoadingComplete] = useState(false); 
  const [users, setUsers] = useState([]);
  const [paginationData, setPaginationData] = useState([]);
  const [page, setPage] = useState(1);
  
  const [headers, setHeaders] = useState([
    {name: 'Name', key: 'name'},
    {name: 'Last name', key: 'last_name'},
    {name: 'Email', key: 'email'},
  ]);

  let loadUsers = 0;
  useEffect(()=>{
    if(loadUsers == 0){
      getUsers(page);
      loadUsers = 1;
    }
  },[])

  const getUsers = async (page = null) =>{
    setLoadingComplete(false);
    try {
      const response = await api.get('/get_users_list', {params: {page: page, pageSize: 10}});
      console.log(response);
      setUsers(response.data.data);
      setPaginationData(response.data);
      setLoadingComplete(true);
    } catch (error) { 
      console.error('Error in logout:', error);
    }
  }

  const changePage = (evt, custom_page) => {
    let page_value = 1;
    if(evt != null){
      page_value = evt.target.value; 
    }else{
      page_value = custom_page;
    }

    setPage(page_value);  
    if (evt == null || evt.key === 'Enter') {
      getUsers(page_value);
    }
  }

  return (
    <>
    <div className='custom-container'>
      <h2>Users</h2>
      {!loadingComplete ? 
        <Loading />
      :
        <List headers={headers} items={users} pagination={paginationData} page={page} changePage={changePage}/>
      }
    </div>
    </>
  );
}
export default UsersList;