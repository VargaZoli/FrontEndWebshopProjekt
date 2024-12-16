// App.tsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Products from './pages/Products';
import Cart from './pages/Cart';
import axios from 'axios';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:3000/check-auth', { withCredentials: true });
        setIsAuthenticated(response.data.authenticated);
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/products');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div>
     <nav>
    <Link to="/login">Login</Link> | 
    <Link to="/register">Register</Link> |
    <Link to="/products">Products</Link> |
    {isAuthenticated && <Link to="/cart">Cart</Link>} | {}
    {isAuthenticated && <button onClick={handleLogout}>Logout</button>}
  </nav>  
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/products"
          element={isAuthenticated ? <Products /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/cart"
          element={isAuthenticated ? <Cart /> : <Login onLogin={handleLogin} />}
        />
       
      </Routes>

    </div>
  );
};

export default App;
