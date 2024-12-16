import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const isAuthenticated = localStorage.getItem('authToken'); 
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('A jelszónak minimum 6 karakter hosszúnak kell lennie, tartalmaznia kell kis- és nagybetűt, valamint számot.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A jelszavak nem egyeznek!');
      return;
    }

    const existingUsernames = ['existingUser1', 'existingUser2']; 
    if (existingUsernames.includes(username)) {
      setError('Ez a felhasználónév már foglalt!');
      return;
    }

    setError('');
    alert('Profil módosítva!');
  };

  return (
    <div>
      <h2>Profil módosítása</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Felhasználónév</label>
          <input 
            type="text" 
            value={username} 
            onChange={handleUsernameChange} 
            placeholder="Új felhasználónév" 
          />
        </div>
        <div>
          <label>Új jelszó</label>
          <input 
            type="password" 
            value={newPassword} 
            onChange={handlePasswordChange} 
            placeholder="Új jelszó" 
          />
        </div>
        <div>
          <label>Jelszó megerősítése</label>
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={handleConfirmPasswordChange} 
            placeholder="Jelszó megerősítése" 
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Módosítás</button>
      </form>
    </div>
  );
};

export default Profile;
