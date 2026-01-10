import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loading from './custom/Loading';
import '../styles/Profile.css';

function Profile() {

  const [loadingComplete, setLoadingComplete] = useState(false);
  const [user, setUser] = useState(null);
 
  const getUser = async () =>{
    setLoadingComplete(false);
    try {
      const response = await api.get('/profile');
      console.log(response);

      let clearUser = response.data.user;
      clearUser.last_name = clearUser.last_name??'';
      
      setUser(clearUser);
      setLoadingComplete(true);

    } catch (error) { 
      console.error('Error getting profile:', error);
    }
  }

  let on = 0;
  useEffect(()=>{
    if(on == 0){
      getUser();
      on = 1;
    }
  },[])

  const handleChangeInput = (evt)=>{
    console.log(evt.target.name, evt.target.value);
    let auxUser = user;
    auxUser[evt.target.name] = evt.target.value
    setUser(auxUser);
  }

  return (
    <>
    <div className='custom-container'>
      <h2>User</h2>
      {!loadingComplete ? 
        <Loading />
      :
        <form className='profile-form'>
            <div><span>{user.email}</span></div>
            <div><input className='custom-input' name='name' value={user.name} onChange={handleChangeInput}/></div>
            <div><input className='custom-input' name='last_name' value={user.last_name} onChange={handleChangeInput}/></div>

            <div>
                <button>Save</button>
            </div>
        </form>
      }
    </div>
    </>
  );
}
export default Profile;