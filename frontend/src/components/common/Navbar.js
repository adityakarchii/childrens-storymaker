import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { FaBook, FaUser, FaSignOutAlt, FaPlus, FaHome } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <FaBook className="brand-icon" />
          <span>Aditya Tells Story</span>
        </Link>

        <div className="nav-menu">
          <Link to="/" className="nav-link">
            <FaHome />
            <span>Home</span>
          </Link>
          
          <Link to="/create" className="nav-link create-btn">
            <FaPlus />
            <span>Create Story</span>
          </Link>
          
          <Link to="/public-stories" className="nav-link">
            <FaBook />
            <span>Explore</span>
          </Link>

          {isAuthenticated ? (
            <div className="nav-user-menu">
              <Link to="/my-stories" className="nav-link">
                My Stories
              </Link>
              
              <div className="nav-dropdown">
                <button className="nav-profile-btn">
                  <FaUser />
                  <span>{user?.name}</span>
                </button>
                
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">
                    <FaUser />
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item">
                    <FaSignOutAlt />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/auth" className="nav-link auth-btn">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
