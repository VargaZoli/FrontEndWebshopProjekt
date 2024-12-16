const express = require('express');
const session = require('express-session');
const cors = require('cors');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'webshop'
});

const sessionStore = new MySQLStore({}, db);

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true 
}));

app.use(bodyParser.json());

app.use(session({
  key: 'session_cookie_name',
  secret: 'your_secret_key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 60000 }
}));

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
  
    console.log('Received data:', { username, password });
  
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
  
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      if (rows.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Error during registration:', error);  
      res.status(500).json({ message: 'Server error, please try again later' });
    }
  });
  

  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      if (rows.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      const user = rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      req.session.user = { id: user.id, username: user.username };
      res.json({ message: 'Login successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('session_cookie_name');
    res.json({ message: 'Logout successful' });
  });
});

app.get('/products', async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products');
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

app.get('/cart', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const [cartItems] = await db.query(
      'SELECT c.id, p.name, p.price, c.quantity FROM cart c JOIN products p ON c.productId = p.id WHERE c.userId = ?',
      [req.session.user.id]
    );
    res.json(cartItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch cart items' });
  }
});

app.post('/cart', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ message: 'Product ID and quantity are required' });
  }

  try {
    await db.query(
      'INSERT INTO cart (userId, productId, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
      [req.session.user.id, productId, quantity, quantity]
    );
    res.json({ message: 'Product added to cart' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add product to cart' });
  }
});

app.delete('/cart/:id', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.params;

  try {
    await db.query('DELETE FROM cart WHERE id = ? AND userId = ?', [id, req.session.user.id]);
    res.json({ message: 'Product removed from cart' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to remove product from cart' });
  }
});

app.delete('/cart', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await db.query('DELETE FROM cart WHERE userId = ?', [req.session.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
});

app.get('/protected', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  res.json({ message: `Welcome, ${req.session.user.username}` });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
