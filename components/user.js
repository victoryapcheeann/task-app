// components/User.js
import { useEffect } from 'react';
import { useAppContext } from '../context/appContext';
import { supabase } from '../utils/supabaseClient';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const User = () => {
  const { allUsers, setAllUsers, currentUser, setCurrentUser } = useAppContext();

  useEffect(() => {
    const fetchUsers = async () => {
      let { data, error } = await supabase.rpc('get_all_persons');

      if (error) {
        console.log('Error loading users:', error);
      } else {
        setAllUsers(data);
        // Set the first user as the default current user
        if (data.length > 0) {
          setCurrentUser(data[0]);
        }
      }
    };

    fetchUsers();
  }, [setAllUsers, setCurrentUser]);

  const handleUserChange = (event) => {
    const selectedUser = allUsers.find(user => user.id === event.target.value);
    setCurrentUser(selectedUser);
  };

  return (
    <div>
        <span style={{ marginRight: '20px' }}>
             Current User:   
        </span>
      <Select
        labelId="user-select-label"
        id="user-select"
        value={currentUser ? currentUser.id : ''}
        label="Current User"
        variant="standard"
        onChange={handleUserChange}
        sx={{ width: '100px' }} 
      >
        {allUsers.map((user) => (
          <MenuItem key={user.id} value={user.id}>
            {user.name}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};

export default User;
