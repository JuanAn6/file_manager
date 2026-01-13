import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loading from './custom/Loading';
import '../styles/Profile.css';
import emptyProfile from '../icons/profile.png'

function Profile() {

  const [loadingComplete, setLoadingComplete] = useState(false);
  const [user, setUser] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const imageInputRef = useRef(null);
 
  const getUser = async () =>{
    setLoadingComplete(false);
    try {
      const response = await api.get('/profile');

      let clearUser = response.data.user;
      clearUser.last_name = clearUser.last_name??'';
      
      setUser(clearUser);
      setLoadingComplete(true);

    } catch (error) { 
      console.error('Error getting profile:', error);
    }
  }

  const getProfileImage = async () =>{
    try {
      const response = await api.get('/get_profile_image', { responseType: 'blob' });
      
      const url = URL.createObjectURL(response.data);
      setProfileImg(url);
    } catch (error) {
      console.error("Not authorized or error loading...", error);
    }
  }


  let on = 0;
  useEffect(()=>{
    if(on == 0){
      getUser();
      getProfileImage();
      on = 1;
    }
  },[])

  const handleChangeInput = (evt)=>{
    let auxUser = {...user};
    auxUser[evt.target.name] = evt.target.value
    setUser(auxUser);
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImg(reader.result); 
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('profile_img', file);

      const response = await api.post('/update_profile_image', formData, { 
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    
    }

  };

  const handleClear = () => {
    setProfileImg(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = ""; 
    }
  };

  const updateProfile = async () => {
    setLoadingComplete(false);
    try {
      const formData = new FormData();

      formData.append('user_data', {...user});

      const response = await api.post('/update_profile', { ...user });
      
      let clearUser = response.data.user;
      clearUser.last_name = clearUser.last_name??'';
      
      setUser(clearUser);
      setLoadingComplete(true);

    } catch (error) { 
      console.error('Error getting profile:', error);
    }
  }

  return (
    <>
    <div className='custom-container'>
      <h2>Profile</h2>
      {!loadingComplete ? 
        <Loading />
      :
        <form className='profile-view' onSubmit={(evt) => {evt.preventDefault(); updateProfile()}}>
            <div className='profile-form'>
              <div><span>{user.email}</span></div>
              { profileImg != null ? 
                <img src={profileImg} width="100" />
                :
                <img src={emptyProfile} width="100"/>
              }
              <input type='file' name='profile_img' ref={imageInputRef} onChange={handleImageChange} accept="image/*"/>
              <div>
                <button type='button' onClick={handleClear}>Clear image</button>
              </div>
              <div className='input-box'>
                <label htmlFor='name'>Name:</label>
                <input className='custom-input' name='name' value={user.name} onChange={handleChangeInput}/>
              </div>
              <div className='input-box'>
                <label htmlFor='last_name'>Last name:</label>
                <input className='custom-input' name='last_name' value={user.last_name} onChange={handleChangeInput}/>
              </div>
              <div><button>Save</button></div>
            </div>
        </form>
      }
    </div>
    </>
  );
}
export default Profile;