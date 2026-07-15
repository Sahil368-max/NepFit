// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// 👇 Added 'Users' and 'ClipboardList' icons for the trainer menu!
import { Activity, Home, Clock, Dumbbell, User, LogOut, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // 1. Initial load of user data
  useEffect(() => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(userData));
    }
  }, []);

  // 2. Listen for profile updates so the name changes instantly without refreshing
  useEffect(() => {
    const updateHeaderName = () => {
      const updatedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
      if (updatedUser) setUser(updatedUser);
    };
    
    window.addEventListener('userProfileUpdated', updateHeaderName);
    return () => window.removeEventListener('userProfileUpdated', updateHeaderName);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? "text-orange-500 bg-orange-50" : "text-gray-600 hover:text-orange-500 hover:bg-gray-50";

  // 👇 NEW: Determine the correct home route based on the user's role!
  const homeRoute = user?.role === 'trainer' ? '/trainerdash' : '/dashboard';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section - Now dynamic! */}
          <Link to={homeRoute} className="flex items-center gap-2 text-orange-600 hover:opacity-80 transition-opacity">
            <Activity size={28} strokeWidth={2.5} />
            <h1 className="text-2xl font-black tracking-tight text-gray-900 hidden sm:block">
              STRIDE<span className="text-orange-500">.FIT</span>
            </h1>
          </Link>

          {/* Center Navigation - Now smart! */}
          <nav className="hidden md:flex space-x-2">
            {user?.role === 'trainer' ? (
              // 🌟 TRAINER LINKS
              <>
                <Link to="/trainerdash" className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${isActive('/trainer-dashboard')}`}>
                  <Users size={18} /> Clients
                </Link>
                <Link to="/trainer-history" className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${isActive('/trainer-history')}`}>
                  <Clock size={18} /> Client History
                </Link>
               
              </>
            ) : (
              // 🌟 REGULAR USER LINKS
              <>
                <Link to="/dashboard" className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${isActive('/dashboard')}`}>
                  <Home size={18} /> Home
                </Link>
                <Link to="/history" className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${isActive('/history')}`}>
                  <Clock size={18} /> History
                </Link>
                <Link to="/exercise" className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${isActive('/exercise')}`}>
                  <Dumbbell size={18} /> Exercises
                </Link>
              </>
            )}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-4">
            
            <Link to="/profile" className="flex items-center gap-2 pl-4 border-l border-gray-200 hover:opacity-70 transition-opacity">
              <div className="bg-orange-100 text-orange-600 p-2 rounded-full hidden sm:block">
                <User size={18} />
              </div>
              <span className="font-bold text-gray-900 hidden sm:block">
                {/* 👇 Added a specific fallback for trainers just in case */}
                {user?.username || (user?.role === 'trainer' ? 'Trainer' : 'Athlete')}
              </span>
            </Link>
            
            <button 
              onClick={handleLogout} 
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-lg flex items-center gap-2"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;