// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { Users, Activity, TrendingUp, ClipboardList, Search, Loader2, Dumbbell } from 'lucide-react';
import { getTrainerClientsFromDB } from '../services/api';
import { toast } from 'react-hot-toast';

const TrainerDashboard = () => {
  const [user, setUser] = useState({ username: 'Coach' });
  const [clients, setClients] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user')) || {};
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(storedUser);
    // eslint-disable-next-line react-hooks/immutability
    fetchClients();
  }, []);

  
  const fetchClients = async () => {
    try {
      const res = await getTrainerClientsFromDB();
      if (res.data.success) {
        setClients(res.data.data);
      }
    } catch (error) {
      console.error("Failed to load clients", error);
      toast.error("Could not load client data from database");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Welcome back, <span className="text-orange-600">{user.username}</span>! 📋
          </h1>
          <p className="text-gray-500 font-medium mt-1">Here is how your clients are performing today.</p>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-xl"><Users size={24} /></div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Clients</p>
            <h3 className="text-2xl font-black text-gray-900">{clients.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Activity size={24} /></div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Needs Mass</p>
            <h3 className="text-2xl font-black text-gray-900">{clients.filter(c => c.goal === 'Gain Mass').length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Needs Weight Loss</p>
            <h3 className="text-2xl font-black text-gray-900">{clients.filter(c => c.goal === 'Lose Weight').length}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="text-orange-500" /> Client Roster (Real DB Data)
          </h2>
          
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white w-full sm:w-64 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p>Fetching clients from database...</p>
            </div>
          ) : clients.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-12 text-gray-400">
              <Dumbbell className="mb-4 text-gray-300" size={48} />
              <p className="font-bold text-gray-500">No users found in the database yet!</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <th className="p-4 pl-6">Client</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Latest BMI</th>
                  <th className="p-4">Total Calories</th>
                  <th className="p-4 text-center">Calculated Goal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
                        {client.avatar}
                      </div>
                      <span className="font-bold text-gray-900">{client.name}</span>
                    </td>
                    <td className="p-4 text-gray-500 text-sm font-medium">{client.email}</td>
                    <td className="p-4 font-bold text-gray-900">{client.bmi}</td>
                    <td className="p-4 font-bold text-orange-600">{client.calories} kcal</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        client.goal === 'Gain Mass' ? 'bg-blue-100 text-blue-700' : 
                        client.goal === 'Lose Weight' ? 'bg-green-100 text-green-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {client.goal}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;