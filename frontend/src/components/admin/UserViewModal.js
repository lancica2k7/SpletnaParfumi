import React from 'react';
import { User } from '../../utils/adminApi';

const UserViewModal = ({ user, onClose }) => {
  return (

        {/* Close button */}
        
          ✕

        {/* Header */}
        
          User Details
          View user information

        {/* Content */}

                Name
              
              {user.name}

                Email
              
              {user.email}

                Role

                  {user.role}

                Status

                  {user.status}

              Last Login
            
            {user.lastLogin}

              User ID
            
            #{user.id}

        {/* Footer */}

            Close

  );
};

export default UserViewModal;

