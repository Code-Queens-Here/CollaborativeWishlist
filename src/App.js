import './App.css';
import { BrowserRouter as Router,Route,Routes } from 'react-router-dom';
import Signup from './components/Customer/Signup/Signup';
import Login from './components/Customer/Login/Login'
import HomePage from './components/Customer/HomePage/HomePage'
import CartItem from './components/Customer/HomePage/cartItems/CartItems'
import AllCarts from './components/Customer/HomePage/cartItems/AllCarts'
import FriendsWishlist from './components/Customer/HomePage/FriendsWishlist'
function App() {
  return (
   <Router>
    <Routes>
      <Route path='/registration' element={<Signup/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/dashboard' element={<HomePage/>}/>
      <Route path='/cart' element={<CartItem/>}/>
      <Route path='/allCarts' element={<AllCarts/>}/>
      <Route path='/friendsWishlist' element={<FriendsWishlist/>}/>
    </Routes>
   </Router>
  );
}

export default App;
