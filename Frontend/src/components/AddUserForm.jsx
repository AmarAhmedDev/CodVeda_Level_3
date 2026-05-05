import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';

const AddUserForm = ({ onAddUser, isLoading }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const success = await onAddUser({ name: name.trim(), email: email.trim() });
    
    if (success) {
      setName('');
      setEmail('');
    }
  };

  return (
    <div className="glass-panel add-user-section">
      <h2>Add New User</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
            disabled={isLoading}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={isLoading || !name.trim() || !email.trim()}>
          {isLoading ? (
            <>
              <div className="spinner spinner-small"></div>
              <span>Adding...</span>
            </>
          ) : (
            <>
              <UserPlus size={18} />
              <span>Add User</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddUserForm;
