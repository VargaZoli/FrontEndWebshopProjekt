import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get('http://localhost:3000/cart', { withCredentials: true });
        setCartItems(response.data);
      } catch (error) {
        console.error('Error fetching cart items', error);
      }
    };

    fetchCartItems();
  }, []);

  const removeFromCart = async (itemId: number) => {
    try {
      await axios.delete(`http://localhost:3000/cart/${itemId}`, { withCredentials: true });
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item from cart', error);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete('http://localhost:3000/cart', { withCredentials: true });
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart', error);
    }
  };

  return (
    <div>
      <h2>Cart</h2>
      <div>
        {cartItems.map((item) => (
          <div key={item.id}>
            <h3>{item.name}</h3>
            <p>{item.price}</p>
            <button onClick={() => removeFromCart(item.id)}>Remove</button>
          </div>
        ))}
      </div>
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  );
};

export default Cart;
