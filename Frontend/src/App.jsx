import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { RefreshCw, LogOut, Bell } from 'lucide-react';
import { io } from 'socket.io-client';
import AddUserForm from './components/AddUserForm';
import UserCard from './components/UserCard';
import Login from './components/Login';
import Signup from './components/Signup';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// GraphQL Queries
const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      role
      createdAt
    }
  }
`;

// GraphQL Mutations
const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!, $role: String) {
    createUser(name: $name, email: $email, role: $role) {
      id
      name
      email
      role
      createdAt
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
      name
    }
  }
`;

function Dashboard({ setAuthStatus }) {
  const [status, setStatus] = useState({ message: '', isError: false });
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin';

  // Apollo useQuery for fetching users
  const { data, loading, refetch } = useQuery(GET_USERS, {
    fetchPolicy: 'network-only',
    onError: (err) => {
      if (err.message.includes('Not authenticated')) {
        handleLogout();
      } else {
        showStatus('Error loading users. Is the backend running?', true);
      }
    }
  });

  const users = data?.users || [];

  // Apollo useMutation for creating a user
  const [createUserMutation, { loading: isAdding }] = useMutation(CREATE_USER, {
    onError: (err) => {
      showStatus(err.message || 'Error adding user.', true);
    }
  });

  // Apollo useMutation for deleting a user
  const [deleteUserMutation] = useMutation(DELETE_USER, {
    onError: (err) => {
      showStatus(err.message || 'Error deleting user.', true);
    }
  });

  const showStatus = (message, isError = false) => {
    setStatus({ message, isError });
    setTimeout(() => {
      setStatus({ message: '', isError: false });
    }, 3000);
  };

  const showNotification = useCallback((message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthStatus(false);
    navigate('/login');
  };

  // Socket.io setup for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socket.on('user_added', (data) => {
      showNotification(data.message);
      refetch(); // Re-fetch the user list via GraphQL
    });

    socket.on('user_updated', (data) => {
      showNotification(data.message);
      refetch();
    });

    socket.on('user_deleted', (data) => {
      showNotification(data.message);
      refetch();
    });

    return () => {
      socket.disconnect();
    };
  }, [showNotification, refetch]);

  const handleAddUser = async (newUser) => {
    try {
      await createUserMutation({
        variables: { name: newUser.name, email: newUser.email, role: newUser.role }
      });
      return true;
    } catch {
      return false;
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await deleteUserMutation({ variables: { id } });
    } catch {
      // Error handled by onError callback
    }
  };

  return (
    <div className="container">
      {/* Toast Notifications Container */}
      <div className="notifications-container">
        {notifications.map(notif => (
          <div key={notif.id} className="toast-notification fade-in-up">
            <Bell size={16} />
            <span>{notif.message}</span>
          </div>
        ))}
      </div>

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

      {isAdmin && <AddUserForm onAddUser={handleAddUser} isLoading={isAdding} />}

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
            onClick={() => refetch()}
            aria-label="Refresh users list"
            disabled={loading}
          >
            <RefreshCw size={20} className={loading ? 'spinning' : ''} />
          </button>
        </div>

        <div className="users-list-container">
          {loading && users.length === 0 ? (
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
