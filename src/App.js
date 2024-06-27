import './App.css';
import { BrowserRouter as Router,Route,Routes } from 'react-router-dom';
import Signup from './components/Customer/Signup/Signup';
import Login from './components/Customer/Login/Login'
import HomePage from './components/Customer/HomePage/HomePage'
import CartItem from './components/Customer/HomePage/cartItems/CartItems'
function App() {
  return (
   <Router>
    <Routes>
      <Route path='/registration' element={<Signup/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/dashboard' element={<HomePage/>}/>
      <Route path='/cart' element={<CartItem/>}/>
    </Routes>
   </Router>
  );
}

export default App;
