// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { User, Mail, Edit3, Save, X, Shield, Camera, Key, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { updateProfileInDB, updatePasswordInDB } from '../services/api';

const Profile = () => {

  const [user, setUser] = useState({ id: null, username: '', email: '' });
  
 
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '' });


  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  
 
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user')) || {};
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(storedUser);
    setFormData({ username: storedUser.username, email: storedUser.email });
  }, []);

  
  const handleSaveProfile = async () => {
    if (!formData.username || !formData.email) {
      return toast.error("Fields cannot be empty");
    }

    setIsLoadingProfile(true);
    try {
      const res = await updateProfileInDB({
        userId: user.id,
        username: formData.username,
        email: formData.email
      });

      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userProfileUpdated'));

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    setFormData({ username: user.username, email: user.email });
    setIsEditing(false);
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("New passwords do not match!");
    }
    if (passwords.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setIsLoadingPassword(true);
    try {
      await updatePasswordInDB({
        userId: user.id,
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });

      toast.success("Password updated successfully! 🔒");
      setIsChangingPassword(false);
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswords({ old: false, new: false, confirm: false });   
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const initial = user.username ? user.username.charAt(0).toUpperCase() : 'U';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      
      <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-6">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
          <User size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Profile</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your personal information and security settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
       
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer mb-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-5xl font-black shadow-lg">
                {initial}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={28} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.username || 'Athlete'}</h2>
            <p className="text-gray-500 font-medium text-sm">{user.email}</p>
            
            <div className="mt-6 w-full pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">Account Status</span>
                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-md font-bold text-xs uppercase tracking-wider">Active</span>
              </div>
            </div>
          </div>
        </div>

        
        <div className="md:col-span-2 space-y-6">
          
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="text-orange-500" size={20} /> Personal Details
              </h3>
              
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                  <Edit3 size={16} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleCancelProfile} disabled={isLoadingProfile} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
                    <X size={16} /> Cancel
                  </button>
                  <button onClick={handleSaveProfile} disabled={isLoadingProfile} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-70">
                    {isLoadingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Username</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className={isEditing ? 'text-orange-500' : 'text-gray-400'} />
                  </div>
                  <input 
                    type="text" 
                    value={formData.username} 
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    disabled={!isEditing}
                    className={`block w-full pl-10 pr-3 py-3 rounded-xl border focus:outline-none transition-colors ${
                      isEditing 
                        ? 'bg-white border-orange-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900' 
                        : 'bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className={isEditing ? 'text-orange-500' : 'text-gray-400'} />
                  </div>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!isEditing}
                    className={`block w-full pl-10 pr-3 py-3 rounded-xl border focus:outline-none transition-colors ${
                      isEditing 
                        ? 'bg-white border-orange-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900' 
                        : 'bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          
          <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 p-6 md:p-8 relative overflow-hidden transition-all duration-300">
             <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 opacity-10 rounded-full blur-2xl pointer-events-none"></div>
             
             <div className="relative z-10">
               <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                 <Shield className="text-orange-500" size={20} /> Security
               </h3>
               <p className="text-gray-400 text-sm mb-6">Manage your password and secure your account.</p>

               {!isChangingPassword ? (
                 <div className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-xl">
                   <div className="flex items-center gap-4">
                     <div className="p-2 bg-gray-700 text-gray-300 rounded-lg">
                       <Key size={20} />
                     </div>
                     <div>
                       <p className="text-white font-bold">Password</p>
                       <p className="text-gray-400 text-sm">••••••••••••</p>
                     </div>
                   </div>
                   <button onClick={() => setIsChangingPassword(true)} className="px-4 py-2 bg-gray-800 text-gray-300 border border-gray-600 font-bold rounded-lg hover:bg-gray-700 transition-colors text-sm">
                     Update
                   </button>
                 </div>
               ) : (
                 <form onSubmit={handleSavePassword} className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4 animate-fade-in">
                   
                   
                   <div>
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Current Password</label>
                     <div className="relative">
                       <Lock className="absolute left-3 top-3 text-gray-500" size={16} />
                       <input 
                         type={showPasswords.old ? "text" : "password"} required
                         value={passwords.oldPassword} 
                         onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                         className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg py-2 pl-10 pr-10 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                         placeholder="Enter current password"
                       />
                       <button 
                         type="button" onClick={() => togglePasswordVisibility('old')}
                         className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors"
                       >
                         {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                     </div>
                   </div>

                   
                   <div>
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">New Password</label>
                     <div className="relative">
                       <Lock className="absolute left-3 top-3 text-gray-500" size={16} />
                       <input 
                         type={showPasswords.new ? "text" : "password"} required
                         value={passwords.newPassword} 
                         onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                         className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg py-2 pl-10 pr-10 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                         placeholder="At least 6 characters"
                       />
                       <button 
                         type="button" onClick={() => togglePasswordVisibility('new')}
                         className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors"
                       >
                         {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                     </div>
                   </div>

                   
                   <div>
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Confirm New Password</label>
                     <div className="relative">
                       <Lock className="absolute left-3 top-3 text-gray-500" size={16} />
                       <input 
                         type={showPasswords.confirm ? "text" : "password"} required
                         value={passwords.confirmPassword} 
                         onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                         className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg py-2 pl-10 pr-10 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                         placeholder="Confirm new password"
                       />
                       <button 
                         type="button" onClick={() => togglePasswordVisibility('confirm')}
                         className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors"
                       >
                         {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                     </div>
                   </div>
                   
                   <div className="flex gap-2 pt-2">
                     <button type="button" onClick={() => setIsChangingPassword(false)} className="flex-1 py-2 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors">
                       Cancel
                     </button>
                     <button type="submit" disabled={isLoadingPassword} className="flex-1 flex justify-center items-center py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-70">
                       {isLoadingPassword ? <Loader2 size={16} className="animate-spin" /> : "Save Password"}
                     </button>
                   </div>
                 </form>
               )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;