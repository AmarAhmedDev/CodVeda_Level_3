import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { RefreshCw, LogOut } from 'lucide-react';
import AddUserForm from './components/AddUserForm';
import UserCard from './components/UserCard';
import Login from './components/Login';
import Signup from './components/Signup';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/users` : 'http://localhost:3000/users';

function Dashboard({ setAuthStatus }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [status, setStatus] = useState({ message: '', isError: false });
  const navigate = useNavigate();

  // Get current user from local storage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin';

  const showStatus = (message, isError = false) => {
    setStatus({ message, isError });
    setTimeout(() => {
      setStatus({ message: '', isError: false });
    }, 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthStatus(false);
    navigate('/login');
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        handleLogout();
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showStatus('Error loading users. Is the backend running?', true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (newUser) => {
    setIsAdding(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });

      if (response.status === 401) {
        handleLogout();
        return false;
      }
      if (!response.ok) throw new Error('Failed to add user');

      showStatus('User added successfully!');
      fetchUsers();
      return true;
    } catch (error) {
      console.error('Error adding user:', error);
      showStatus('Error adding user. Try again.', true);
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }
      if (response.status === 403) {
        showStatus('Admin access required to delete users.', true);
        return;
      }
      if (!response.ok) throw new Error('Failed to delete user');
      
      showStatus('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showStatus('Error deleting user. Try again.', true);
    }
  };

  return (
    <div className="container">
      <header style={{ position: 'relative' }}>
        <button 
          onClick={handleLogout}
          className="btn-icon" 
          style={{ position: 'absolute', right: 0, top: 0, border: 'none' }}
          title="Logout"
        >
          <LogOut size={24} />
        </button>
        <h1>User Directory</h1>
        <p>Logged in as: {currentUser.name} ({currentUser.role})</p>
      </header>

      <AddUserForm onAddUser={handleAddUser} isLoading={isAdding} />

      {status.message && (
        <div style={{textAlign: 'center', marginBottom: '1rem'}}>
          <div className={`status-message ${status.isError ? 'error' : 'success'}`}>
            {status.message}
          </div>
        </div>
      )}

      <div className="glass-panel">
        <div className="section-header">
          <h2>Current Users</h2>
          <button 
            className="btn-icon" 
            onClick={fetchUsers}
            aria-label="Refresh users list"
            disabled={isLoading}
          >
            <RefreshCw size={20} className={isLoading ? 'spinning' : ''} />
          </button>
        </div>

        <div className="users-list-container">
          {isLoading && users.length === 0 ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Fetching users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="loading-state">
              <p>No users found. Add one above!</p>
            </div>
          ) : (
            <div className="users-grid">
              {users.map((user, index) => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  index={index} 
                  onDelete={isAdmin ? handleDeleteUser : null} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const location = useLocation();

  useEffect(() => {
    // Check auth status on route change
    setIsAuthenticated(!!localStorage.getItem('token'));
  }, [location]);

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login setAuthStatus={setIsAuthenticated} /> : <Navigate to="/" />} 
      />
      <Route 
        path="/signup" 
        element={!isAuthenticated ? <Signup setAuthStatus={setIsAuthenticated} /> : <Navigate to="/" />} 
      />
      <Route 
        path="/" 
        element={isAuthenticated ? <Dashboard setAuthStatus={setIsAuthenticated} /> : <Navigate to="/login" />} 
      />
    </Routes>
  );
}

export default App;
