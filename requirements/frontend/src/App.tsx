import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState} from 'react';
import Home from './components/home/Home';
import PrivateRoute from './PrivateRoute';
import Login from './components/Login/Login';
import RoomSelect from './components/chat/RoomSelect';
import { User } from './components/types';
import Friend from './components/friend/list/src/friend';

function App() {

  const [token, setToken] = useState<string>('')

  const updateToken = (token: string) => {
    setToken(token)
  }

  const tester : User = {username : 'Octo', id : 1, elo : 2560, win : 44, loose : 33, createAt : '0', updateAt : '0', state : 'undefined'};

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" Component={(props) => <Login {...props} updateToken={updateToken} />} />
          <Route path='/home'
          element={
           <Home />
          }/>
          <Route path='/chat' element={ <RoomSelect user={tester} changeComponent={function (component: string): void {
            throw new Error('Function not implemented.');
          } } status={''} />}/>
          <Route path='/friends' element={<Friend changeComponent={function (component: string): void {
            throw new Error('Function not implemented.');
          } } />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
