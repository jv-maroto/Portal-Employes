import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './utils/PrivateRoute';
import PostList from './pages/PostList';
import PostDetail from './pages/PostDetail';

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Header/>
          <Routes>
            <Route path="/" element={<PrivateRoute><HomePage/></PrivateRoute>} />
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/posts" element={<PrivateRoute><PostList/></PrivateRoute>} />
            <Route path="/posts/:id" element={<PrivateRoute><PostDetail/></PrivateRoute>} />
          </Routes>
          <Footer/>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
