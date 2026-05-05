import React from 'react';
import { Trash2 } from 'lucide-react';

const UserCard = ({ user, onDelete, index }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="user-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="user-info">
        <div className="avatar">{getInitials(user.name)}</div>
        <div className="details">
          <h3 title={user.name}>{user.name}</h3>
          <p title={user.email}>{user.email}</p>
        </div>
      </div>
      <div className="user-actions">
        {onDelete && (
          <button 
            className="btn-delete" 
            onClick={() => onDelete(user.id)}
            aria-label="Delete user"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
